from datetime import datetime
from backend import db
from flask_login import UserMixin
from flask import jsonify



class Follow(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Follow(follower:'{self.follower_id}' followed:'{self.followed_id}' time:'{self.timestamp}')"


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
    travels = db.relationship('Travel', backref='traveler', lazy='dynamic', cascade='all, delete-orphan')
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

    def update(self, data):
        for attr in data:
            setattr(self, attr, data[attr])
        db.session.commit()

    def follow(self, user):
        if not self.is_following(user):
            f = Follow(follower=self, followed=user)
            db.session.add(f)
            db.session.commit()

    def unfollow(self, user):
        f = self.followed.filter_by(followed_id=user.id).first()
        if f:
            db.session.delete(f)
            db.session.commit()

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

   # def get_followers(self):
    #    User.query.join(User.followers).filter_by(followed_id=self.id).all()

    def is_subscribed(self, post):
        if post.id is None:
            return False
        return self.subcribed_posts.filter_by(
           post_id=post.id).first() is not None

    def subscribe(self, post):
        if not self.is_subscribed(post):
            f = Subscriptions(user_id=self.id, post_id=post.id)
            db.session.add(f)
            db.session.commit()

    def unsubscribe(self, post):
        found_post = self.subcribed_posts.filter_by(post_id=post.id).first()
        if found_post:
            db.session.delete(found_post)
            db.session.commit()
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
            db.session.commit()


class Travel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    country = db.Column(db.Text, nullable=False)
    city = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    content = db.Column(db.Text, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    image_file = db.Column(db.Text,nullable=False,default="default_post.jpeg")
    subscribers = db.relationship('Subscriptions', backref='subscribers',
                                  lazy='dynamic', cascade='all, delete-orphan')

    def update(self, data):
        for attr in data:
            setattr(self, attr, data[attr])
        db.session.commit()
        for sub in self.subscribers.all():
            sub.send_notification()

    def _repr_(self):
        return f"Travel('{self.start_date}', '{self.end_date}', '{self.content}')"


class Subscriptions(db.Model):
    post_id = db.Column(db.Integer, db.ForeignKey('travel.id',ondelete="CASCADE"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id',ondelete="CASCADE"), primary_key=True)

    def send_notification(self):
        note = Notifications(post_id=self.post_id, user_id=self.user_id, content="post has been updated")
        db.session.add(note)
        db.session.commit()


class Notifications(db.Model):
    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey('travel.id',ondelete="CASCADE"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id',ondelete="CASCADE"), primary_key=True)
    content = db.Column(db.String(120), nullable=False)
    showed = db.Column(db.Boolean, nullable=False, default=False)
    time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def update(self, data):
        print("update")
        print(data)
        for attr in data:
            print(attr, data[attr])
            setattr(self, attr, data[attr])
        db.session.commit()
        #for sub in self.subscribers.all():
        #    sub.send_notification()


db.create_all()