# Instagram-Clone
Create Restful API for the given features
Features to be implemented
# User registration---
a) name,
b) user_id(auto increment integer number),
c) Password (minimum 8 character, first char capital, alphanumeric, use of
special char)
d) email_id(unique, validation for proper email format)
e) User_name (unique)
f) Gender (male/female/other)
g) Mobile (mobile number validation, with country code)
h) Profile will be public / private (bonus)
# User Login
a) User can login with his created credentials and make use of JWT token for
verification for all furter interaction by user
# User can upload their post
a) Post can contain
i) Text
ii) Images And videos at same time or any one
b) Public / private status of post
c) Hashtag (bonus)
d) Friend tag (bonus)
e) Comment(bonus)
i) Sub-comment (bonus)
#  Users can follow and unfollow other users.
#  User can also like post, delete own post
a) User can only like post one time only
#  We(user) can block any other user, means we cannot see his post/profile and he
can’t see our post/profile (bonus)
#  Profile api
1. profile details
2. follower count
3. following count
4. get list of all users who liked my post (hint: use aggregation)
5. post count
#  Explore APIs (hint: use aggregation)
1. List only public post with Get latest uploaded post(like instagram feeds)
a. Add extra field in reply is the current user liked this post or not
2. Get every time random post (extra bonus) //ye ho gya
3. Not getting blocked user post (bonus)
4. Pagination show 10 post per page
5. List down the post which is liked by me (user) only
6. My own post should not be listed in this api.
#  Edit profile
#  Edit post
#  Delete post (soft delete)
#  Unblock user (bonus)
