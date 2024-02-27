# Instagram-Clone
Create Restful API for the given features-------

# 1. User registration-------------
a) profileImage,
b) name,
c) emailId(unique, validation for proper email format),
d) password (minimum 8 character, first char capital, alphanumeric, use of
special char),
e) userName (unique),
f) gender (male/female/other)
g) mobile (only indian mobile number allowed)
h) profileStatus will be public / private.

Note- verify user emailId using nodemailer and after verified email user can login, otherwise send message  "verified your email".

# 2. User Login-----------------------
   User can login with his created credentials and make use of JWT token for
   verification for all furter interaction by user.

# 3. User can upload their post------------
a) Post can contain
i) Text
ii) Images And videos at same time or any one.
b) poststatus will be Public / private 
c) user can tags other user in their post like - Friend tag
d) Comment
e) Sub-Comment

# 4. Users can follow and unfollow other users.
# 5. User can also like post, update, delete own post (User can only like post one time only).
# 6. User can also comment/sub-comment on post as well as only authorized user can update and delete their comment and sub-comment.
# 7. We(user) can block/unblock any other user, means we cannot see his post/profile.

# 8. Profile api---------
1. profile details.
2. follower count.
3. following count.
4. get list of all users who liked my post.
5. post count.

# 9. Only authorised user can update their profile.
# 10. Only authorised user can update or delete their post.
 


# 11. Other API------------
1. Any user can see other user profile if (he/she) are not blocked by the profile user.
2. user can see their all post like activity(User get the latest post)
3. Loggedin user get all post, but not getting blocked user post.(User get the latest post)
4. when user refresh the post page show the random post.(User get the latest post)
5. If user profile is private then other user's are not able to view their follower, following and the profileImage.
6. If user make their post private then other user can not like, comment , and shared the post.  
7. List only public post with Get latest uploaded post(like instagram feeds)
8. User can change their password and can update their email and when they update their email, again verify their updated email using nodemailer.
9. If user forget their passowrd , provide them to reset password options.
10. User can Logout and after logout user cannot use user profile api's.
11. User can  deactivate their account for temporary time. notifications.
12. User can delete their account(soft delete).
13. user get suggestions to follow other user.
14. Create searching api to find user by name.
    user can post stories and after 24hour later it will remove. and post would be 30 or 60 seconds b/w.
User get notifications when their follower or following create a post, likes, comments  on their own post or a other User's tag(him/her).

ek kaam ye bhi kerna hai ki jab user apna account agar delete kerta hai to usne jisko bhi follow kiya hai vha se remove bhi kerna hai.
main yha chahta hu ki video ki length 60 seconds se jyada nahi honi chahiye ---ye waala point baaki hai abhi kerna poststories main