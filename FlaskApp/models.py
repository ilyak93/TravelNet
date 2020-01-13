from datetime import datetime
from FlaskApp import db, login_manager
from flask_login import UserMixin


class Follow(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Follow('{self.timestamp}')"


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(20))
    last_name = db.Column(db.String(20))
    gender = db.Column(db.String(20), nullable=False)
    birth_date = db.Column(db.Date())
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    travels = db.relationship('Travel', backref='traveler', lazy='dynamic')
    followed = db.relationship('Follow', foreign_keys=[Follow.follower_id], backref=db.backref('follower', lazy='joined'),
                               lazy='dynamic', cascade='all, delete-orphan')
    followers = db.relationship('Follow',
                                foreign_keys=[Follow.followed_id],
                                backref=db.backref('followed', lazy='joined'),
                                lazy='dynamic',
                                cascade='all, delete-orphan')
    subcribed_posts = db.relationship('Subscriptions', backref='subcribed_posts',
                                  lazy='dynamic',cascade='all, delete-orphan')
    notifications = db.relationship('Notifications', backref='notifications',
                                  lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"User('{self.username}', '{self.email}', '{self.image_file}')"

    def follow(self, user):
        if not self.is_following(user):
            f = Follow(follower=self, followed=user)
            db.session.add(f)

    def unfollow(self, user):
        f = self.followed.filter_by(followed_id=user.id).first()
        if f:
            db.session.delete(f)

    def is_following(self, user):
        if user.id is None:
            return False

        return self.followed.filter_by(
            followed_id=user.id).first() is not None

    def is_followed_by(self, user):
        if user.id is None:
            return False
        return self.followers.filter_by(
            follower_id=user.id).first() is not None

    def is_subscribed(self, post):
        if post.id is None:
            return False
        return self.subcribed_posts.filter_by(
           post_id=post.id).first() is not None

    def subscribe(self, post):
        if not self.is_subscribed(post):
            f = Subscriptions(user_id=self.id, post_id=post.id)
            db.session.add(f)

    def unsubscribe(self, post):
        found_post = self.subcribed_posts.filter_by(post_id=post.id).first()
        if found_post:
            db.session.delete(found_post)
    '''
    def show_notification(self, notification):
        found_notification = self.notifications.filter_by(
            notification_id = notification.notification_id).first()
        if found_notification.showed:
            Notifications.update().where(
                notification_id == found_notification.notification_id).values(showed=True)
    '''

    def delete_notification(self, notification):
        found_notification = self.notifications.filter_by(
            notification_id=notification.notification_id).first()
        if found_notification:
            db.session.delete(found_notification)


class Travel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    country = db.Column(db.Text, nullable=False)
    city = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Integer, nullable=False)
    longitude = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    subscribers = db.relationship('Subscriptions', backref='subscribers',
                                  lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"Travel('{self.date_posted}')"


class Subscriptions(db.Model):
    post_id = db.Column(db.Integer, db.ForeignKey('travel.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)


class Notifications(db.Model):
    notification_id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('travel.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    content = db.Column(db.String(120), nullable=False)
    showed = db.Column(db.Boolean, nullable=False, default=False)


db.create_all()