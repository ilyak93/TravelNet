import os
import secrets
from PIL import Image
from flask import url_for, request, abort, jsonify, make_response
from backend import app, db, bcrypt, login_manager
from backend.models import User, Follow, Travel, Notifications
from flask_login import login_user, current_user, logout_user, login_required
from flask_jwt_extended import (create_access_token)
import datetime
import math
from datetime import datetime
import mpu


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/pictures', picture_fn)

    output_size = (125, 125)
    i = Image.open(form_picture)
    i.thumbnail(output_size)
    i.save(picture_path)
    return picture_fn


@app.errorhandler(404)
def not_found(error):
    return make_response((jsonify({'error': 'Not Found'})), 404)


@app.errorhandler(400)
def bad_request(error):
    return make_response((jsonify({'error': 'Bad Request'})), 400)


@app.errorhandler(403)
def forbidden(error):
    return make_response((jsonify({'error': 'Forbidden'})), 403)


@app.route("/users/<int:user_id>", methods=['GET', 'PUT', 'DELETE'])
@login_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)  # TODO: check privilage
    if request.method == 'GET':
        image_file = url_for('static', filename='pictures/' + user.image_file)
        return jsonify({'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name,
                        'gender': user.gender, 'birth_date': user.birth_date, 'email': user.email,
                        'image_file': image_file, 'followers': len(user.followers.all()),
                        'followed': len(user.followed.all())})
    elif request.method == 'PUT':
        if current_user.id != user_id:
            abort(403)
        data = request.get_json()
        if not data or 'username' not in data or 'first_name' not in data \
                or 'last_name' not in data or 'gender' not in data or 'birth_date' not in data or 'email' not in data:
            abort(400)
        try:
            user.update(data)
        except Exception as e:
            user_c = User.query.filter_by(username=data['username']).first()
            if user_c:
                return 'Username Taken'
            user_c = User.query.filter_by(email=data['email']).first()
            if user_c:
                return 'Email Taken'
        # TODO:enable password change?
        return "Updated"
    elif request.method == 'DELETE':
        if current_user.id != user_id:
            abort(403)
        db.session.delete(user)
        db.session.commit()
        logout_user()
        return "Deleted"


@app.route("/user/<string:name>", methods=['GET'])
def get_user_id(name):
    user = User.query.filter_by(username=name).first()
    if not user:
        abort(404)
    return jsonify({'id': user.id})


@app.route("/follow/<int:user_id>", methods=['POST', 'DELETE'])
@login_required
def follow_user(user_id):  # TODO: check if allready following and if followd exsists
    user = User.query.get_or_404(user_id)
    if request.method == 'POST':
        current_user.follow(user)
        return "following"
    else:
        current_user.unfollow(user)
        return "not following"

'''
def create_pic_dir(user_id):
    url = os.path.join(app.root_path, 'static/pictures', str(user_id), "posts")
    os.makedirs(url,)
    # with open("static/pictures/"+str(user_id)+"/posts_img") as p:
    return

'''

def create_pic_dir(user_id):
    url = os.path.join(app.root_path, 'static/pictures', str(user_id), "posts")
    os.makedirs(url, exist_ok=True)
    return



@app.route("/user/new", methods=['POST'])
def register():
    if current_user.is_authenticated:
        print("user connected")
        abort(400)
    data = request.get_json()
    # TODO: add initial post
    if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
            or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
        abort(400)
    check_user = User.query.filter_by(email=data['email']).first()
    if check_user:
        return 'Email Taken'
    check_user = User.query.filter_by(username=data['username']).first()
    if check_user:
        return 'Username Taken'
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    user = User(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                gender=data['gender'], birth_date=data['birth_date'], email=data['email'], password=hashed_password)
    try:
        db.session.add(user)
        db.session.commit()
        create_pic_dir(user.id)  # TODO: CHANGES
    except Exception as e:
        print(e)
        return "error"

    return 'Created'


@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:  # TODO: something better
        abort(404)
    user_data = request.get_json()
    if not user_data or 'password' not in user_data or 'email' not in user_data:
        abort(400)

    user = User.query.filter_by(email=user_data['email']).first()
    if user and bcrypt.check_password_hash(user.password, user_data['password']):
        login_user(user, remember=True)
        access_token = create_access_token(identity={'id': user.id})
        result = access_token
    else:
        abort(400)

    return result


@app.route("/logout", methods=['GET'])
@login_required
def logout():
    print('logging out')

    logout_user()
    return 'Logged Out', 201


@app.route("/subscribe/<int:post_id>", methods=['POST', 'DELETE'])
@login_required
def change_subscription(post_id):
    post = Travel.query.get_or_404(post_id)
    if request.method == "POST":
        current_user.subscribe(post)
    elif request.method == "DELETE":
        current_user.unsubscribe(post)
    return "done"


@app.route("/is_subscribed/<int:post_id>", methods=['GET'])
@login_required
def is_subscribed(post_id):
    post = Travel.query.get_or_404(post_id)
    return str(current_user.is_subscribed(post))


@app.route("/users/feed/<int:user_id>", methods=["GET"])
@login_required
def bring_feed(user_id):
    user = User.query.get_or_404(user_id)
    if user.id != current_user.id:
        abort(403)
    abort(400)
    feed = get_post_list(user_id).json['posts_array'] + (followed_travel_partners_search().json['posts_array'])
    print(101)
    feed.sort(key=lambda x: datetime(x['date_posted']))
    print(feed)
    return jsonify({'posts_array': feed})


@app.route('/is_following/<int:user_id>', methods=['GET'])
@login_required
def is_following(user_id):
    user = User.query.get_or_404(user_id)

    if current_user.is_following(user):
        return 'True'
    return 'False'


@app.route('/is_following_me/<int:user_id>', methods=['GET'])
@login_required
def is_following_me(user_id):
    user = User.query.get_or_404(user_id)
    if user.is_following(current_user):
        return 'True'
    return 'False'


@app.route('/following/<int:user_id>', methods=['GET'])
@login_required
def following_list(user_id):
    user = User.query.get_or_404(user_id)

    following = user.followed.join(User, User.id == Follow.followed_id) \
        .add_columns(User.id, User.image_file, User.username).all()
    if current_user.id != user_id and not current_user.is_following(user):
        abort(403)
    return jsonify(
        {"following": [*map(lambda i: {"username": i.username, "id": i.id, "image_file": i.image_file}, following)]})


@app.route("/user/find/<string:partial>", methods=['GET'])
@login_required
def find_like_user(partial):
    users = User.query.filter(User.username.ilike("%" + partial + "%")).all()
    print(users)
    return jsonify({"found": [*map(lambda i: {"username": i.username, "id": i.id, "image_file": i.image_file}, users)]})


@app.route("/post/<int:post_id>", methods=['GET'])
@login_required
def get_post(post_id):
    post = Travel.query.get_or_404(post_id)
    print(101)
    user = User.query.get_or_404(post.user_id)
    return jsonify({"title": post.title, "username": user.username,
                    "firstname": user.first_name,
                    "lastname": user.last_name,
                    "user_id": post.user_id,
                    "comment": post.comment,
                    "start_d": post.start_date, "end_d": post.end_date, "country": post.country, "city": post.city,
                    "latitude": post.latitude, "longitude": post.longitude, "description": post.content,
                    "image_file": "/static/pictures/" + post.image_file})


@app.route("/post/<int:post_id>", methods=['DELETE'])
@login_required
def delete_post(post_id):
    post = Travel.query.get_or_404(post_id)
    print(101)
    if current_user.id != post.user_id:
        abort(403)

    db.session.delete(post)
    db.session.commit()
    return "Deleted"


@app.route("/post/<int:post_id>", methods=['PUT'])
@login_required
def update_post(post_id):
    post = Travel.query.get_or_404(post_id)
    data = request.get_json()
    if current_user.id != post.user_id:
        abort(403)

    post.update(request.get_json())  # TODO:post.update
    return "Updated"


@app.route("/posts/user/<int:user_id>", methods=['GET'])
@login_required
def get_post_list(user_id):
    user = User.query.get_or_404(user_id)
    posts = Travel.query.filter_by(user_id=user_id).join(User, User.id == Travel.user_id).all()
    return jsonify(
        {"posts_array": [*map(lambda post_i: {"id": post_i.id,
                                              "title": post_i.title,
                                              "date_posted": post_i.date_posted,
                                              "user_id": post_i.user_id,
                                              "start_date": post_i.start_date,
                                              "end_date": post_i.end_date,
                                              "country": post_i.country,
                                              "city": post_i.city,
                                              "lat": post_i.latitude,
                                              "lng": post_i.longitude,
                                              "content": post_i.content,
                                              "comment": post_i.comment,
                                              "username": user.username,
                                              "image": "/static/pictures/" + user.image_file,
                                              "image_file": "/static/pictures/" + post_i.image_file
                                              }, posts)]})


@app.route("/posts/new", methods=['POST'])
@login_required
def add_post():
    params = ['title', 'user_id', 'start_d', 'end_d', 'latitude', 'longitude', 'city', 'country', 'description',
              'comment']
    data = request.get_json()
    print(data['description'])

    if not data:
        abort(400)
    for p in params:
        if p not in data:
            print(p)
            abort(400)
    if current_user.id != data['user_id']:
        abort(403)
    post = Travel(title=data['title'], user_id=data['user_id'], start_date=data['start_d'], end_date=data['end_d'],
                  country=data['country'], city=data['city'], latitude=data['latitude'], \
                  longitude=data['longitude'], content=data['description'], comment=data['comment'])
    db.session.add(post)
    db.session.commit()

    return str(post.id)


@app.route('/followers/<int:user_id>', methods=['GET'])
@login_required
def followers_list(user_id):
    user = User.query.get_or_404(user_id)
    followers = user.followers.join(User, User.id == Follow.follower_id).add_columns(User.id, User.image_file,
                                                                                     User.username).all()
    if current_user.id != user_id and not current_user.is_following(user):
        abort(403)
    return jsonify(
        {"followers": [*map(lambda i: {"username": i.username, "id": i.id, "image_file": i.image_file}, followers)]})


@app.route('/image/profile', methods=['PUT', 'POST'])
@login_required
def add_image_to_server():
    file_path = os.path.join(app.root_path, 'static/pictures', str(current_user.id)+".png")
    print(file_path)
    with open(file_path, "wb") as pic:
        pic.write(request.data)
        print('done upload pic')

    current_user.update({"image_file": str(current_user.id) + ".png"})
    return str(current_user) + ".png"


@app.route('/image/profile', methods=['DELETE'])
@login_required
def delete_pic(post_id):
    # os.remove("./backend/static/pictures/" + str(user_id) + ".png")
    current_user.update({"image_file": "default.jpg"})
    return "default.jpg"


# TODO:update cache


@app.route('/image/post/<int:post_id>', methods=['PUT', 'POST'])
@login_required
def add_image_to_post(post_id):
    post = Travel.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        abort(403)
    file_path = os.path.join(app.root_path, 'static/pictures', str(current_user.id),str(post_id) + ".png")
    with open(file_path, "wb") as pic:
        pic.write(request.data)
        print('done upload pic')

    setattr(post, "image_file", str(current_user.id) + "/" + str(post_id) + ".png")
    db.session.commit()
    return str(current_user) + ".png"


@app.route('/image/post/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post_pic(post_id):
    post = Travel.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        abort(403)
    # os.remove("./backend/static/pictures/" + str(user_id) + ".png")
    post.update({"image_file": "default_post.jpeg"})
    return "default.jpg"


def date_between(start_date, end_date, start_date_arg, end_date_arg):
    start_date_arg_converted = datetime.datetime.strptime(start_date_arg.split('T')[0], '%Y-%m-%d').date()
    end_date_arg_converted = datetime.datetime.strptime(end_date_arg.split('T')[0], '%Y-%m-%d').date()

    if start_date.date() <= end_date_arg_converted:
        return end_date.date() >= start_date_arg_converted
    return False


# Distance function
def distance(lat1, lon1, lat2, lon2):
    dist = mpu.haversine_distance((lat1, lon1), (lat2, lon2))
    return dist


@app.route("/travelpartners", methods=['GET'])
@login_required
def followed_travel_partners_search():  # TODO: use length_unit
    user = User.query.get_or_404(current_user.id)
    posts_of_followed_users = user.followed.join(Travel, Travel.user_id == Follow.followed_id) \
        .add_columns(Travel.id, Travel.title, Travel.date_posted,
                     Travel.user_id, Travel.start_date, Travel.end_date,
                     Travel.country, Travel.city, Travel.latitude,
                     Travel.longitude, Travel.content, Travel.comment, Travel.image_file).all()

    return jsonify(
        {"posts_array": [*map(lambda post_i: {"id": post_i.id,
                                              "title": post_i.title,
                                              "date_posted": post_i.date_posted,
                                              "user_id": post_i.user_id,
                                              "start_date": post_i.start_date,
                                              "end_date": post_i.end_date,
                                              "country": post_i.country,
                                              "city": post_i.city,
                                              "lat": post_i.latitude,
                                              "lng": post_i.longitude,
                                              "content": post_i.content,
                                              "comment": post_i.comment,
                                              "username": get_user(post_i.user_id).json['username'],
                                              "image": get_user(post_i.user_id).json['image_file'],
                                              "image_file": "/static/pictures/" + post_i.image_file
                                              }, posts_of_followed_users)]})


@app.route("/travelpartners", methods=['POST'])
@login_required
def travel_partners_search():  # TODO: use length_unit
    dict = request.json
    posts = Travel.query.all()
    posts_to_return = []
    for post in posts:
        if distance(dict['lat'], dict['lng'], post.latitude, post.longitude) <= float(dict['radius']) and \
                ((dict['start_date'][0:10] <= str(post.end_date) <= dict['end_date'][0:10]) or
                 dict['start_date'][0:10] <= str(post.start_date) <= dict['end_date'][0:10]):
            posts_to_return.append(post)
    return jsonify(
        {"posts_array": [*map(lambda post_i: {"id": post_i.id,
                                              "title": post_i.title,
                                              "date_posted": post_i.date_posted,
                                              "user_id": post_i.user_id,
                                              "start_date": post_i.start_date,
                                              "end_date": post_i.end_date,
                                              "country": post_i.country,
                                              "city": post_i.city,
                                              "lat": post_i.latitude,
                                              "lng": post_i.longitude,
                                              "content": post_i.content,
                                              "image_file": "/static/pictures/" + post_i.image_file
                                              }, posts_to_return)]})


@app.route("/", methods=['GET'])
@login_required
def get_notifications():  # TODO: use length_unit
    cur_user = User.query.get_or_404(current_user.id)
    all_user_notifications = Notifications.query \
        .filter_by(user_id=cur_user.id) \
        .order_by(Notifications.time.desc()).all()
    return jsonify(
        {"all_notifications": [*map(lambda notification_i: {
            "notification_id": notification_i.notification_id,
            "post_id": notification_i.post_id,
            "user_id": notification_i.user_id,
            "content": notification_i.content,
            "showed": notification_i.showed,
            "time": notification_i.time
        }, all_user_notifications)]})


@app.route("/", methods=['POST'])
@login_required
def update_notification_showed_flag():  # TODO: use length_unit
    notification = request.get_json()
    notf = Notifications.query.filter_by(notification_id=notification["notification_id"]).first()
    json = {
        "notification_id": notification["notification_id"],
        "post_id": notification["post_id"],
        "user_id": notification["user_id"],
        "content": notification["content"],
        "showed": True,
        "time": notification["time"]
    }
    print(json)
    notf.update(json)
    return "Updated"


@app.route("/notifications/<int:notification_id>", methods=['DELETE'])
@login_required
def delete_notification(notification_id):  # TODO: use length_unit
    notification = Notifications.query.filter_by(notification_id=notification_id).first()
    db.session.delete(notification)
    db.session.commit()
    return jsonify(
        {
            "notification_id": notification.notification_id,
            "post_id": notification.post_id,
            "user_id": notification.user_id,
            "content": notification.content,
            "showed": notification.showed,
            "time": notification.time
        }
    )


@app.route("/notifications", methods=['GET'])
@login_required
def get_notifications_and_authors_of_posts():  # TODO: use length_unit
    cur_user = User.query.get_or_404(current_user.id)
    all_user_notifications_with_authors_and_post_images = Notifications.query \
        .filter_by(user_id=cur_user.id) \
        .order_by(Notifications.time.desc()).join(Travel, Notifications.post_id == Travel.id) \
        .join(User, Travel.user_id == User.id) \
        .add_columns(Travel.user_id, Travel.image_file.label("post_image_file"), User.first_name,
                     User.last_name, User.gender, User.image_file).all()
    json = jsonify(
        {"all_notifications": [*map(lambda notification_i: {
            "notification_id": notification_i[0].notification_id,
            "post_id": notification_i[0].post_id,
            "user_id": notification_i[0].user_id,
            "author_id": notification_i.user_id,
            "author_first_name": notification_i.first_name,
            "author_last_name": notification_i.last_name,
            "author_gender": notification_i.gender,
            "image_file": notification_i.image_file,
            "post_image_file": notification_i.post_image_file,
            "content": notification_i[0].content,
            "showed": notification_i[0].showed,
            "time": notification_i[0].time
        }, all_user_notifications_with_authors_and_post_images)]})
    return json


'static/pictures'
