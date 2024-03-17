import { belongsTo, Factory, hasMany } from 'miragejs';
import { faker } from '@faker-js/faker';

export const schemas = {
  appUser: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    signupDate() {
      return faker.date.past();
    },
    email() {
      return faker.internet.email();
    },
    password() {
      return faker.internet.password();
    },
    authProvider: faker.helpers.arrayElement(['local', 'google', 'github']),
    emailVerified: faker.datatype.boolean(),
    userProfileId() {
      return faker.string.uuid();
    },
    userProfile: belongsTo('userProfile'),
    userSessions: hasMany('userSession'),
    userTokens: belongsTo('userTokens'),
  }),

  userTokens: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    appUserId() {
      return faker.string.uuid();
    },
    forgotPasswordToken() {
      return faker.string.alpha({ length: 32 });
    },
    forgotPasswordTokenExpiry() {
      return faker.date.future().toISOString();
    },
    emailVerificationToken() {
      return faker.string.alpha({ length: 32 });
    },
    emailVerificationExpiry() {
      return faker.date.future().toISOString();
    },
    appUser: belongsTo('appUser'),
  }),

  userProfile: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    firstName() {
      return faker.person.firstName();
    },
    lastName() {
      return faker.person.lastName();
    },
    fullName() {
      return faker.person.fullName();
    },
    username() {
      return faker.internet.userName();
    },
    profileImg() {
      return faker.image.avatar();
    },
    gender: faker.helpers.arrayElement(['male', 'female']),
    dateOfBirth() {
      return faker.date.past().toISOString();
    },
    bannerImg() {
      return faker.image.url();
    },
    bio() {
      return faker.lorem.sentence();
    },
    location() {
      return faker.location.city();
    },
    followersCount: faker.number.int(),
    followingCount: faker.number.int(),
    appUser: belongsTo('appUser'),
    userJoinedCommunity: hasMany('userJoinedCommunity'),
    threads: hasMany('thread'),
    posts: hasMany('post'),
    commentOnPosts: hasMany('postComment'),
    likedPosts: hasMany('likedPost'),
    postMedia: hasMany('postMedia'),
    bookmarkCategory: hasMany('bookmarkCategory'),
    followers: hasMany('follower'),
    following: hasMany('follower'),
    replies: hasMany('replies'),
  }),

  userSession: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    browser() {
      return faker.internet.userAgent();
    },
    device() {
      return faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']);
    },
    ipAddress() {
      return faker.internet.ip();
    },
    os() {
      return faker.helpers.arrayElement(['Windows', 'macOS', 'Linux']);
    },
    signedInOn() {
      return faker.date.past();
    },
    userid() {
      return faker.string.uuid();
    },
    accessToken() {
      return faker.string.alphanumeric(64);
    },
    refreshToken() {
      return faker.string.alphanumeric(64);
    },
    user: belongsTo('appUser'),
  }),

  community: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    userJoinedCommunity: hasMany('userJoinedCommunity'),
  }),

  thread: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    creatorId() {
      return faker.string.uuid();
    },
    creator: belongsTo('userProfile'),
    threadPostsMapping: hasMany('threadPostsMapping'),
  }),

  postComment: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    caption() {
      return faker.lorem.sentence();
    },
    commentBy() {
      return faker.string.uuid();
    },
    postId() {
      return faker.string.uuid();
    },
    likesCount: faker.number.int(),
    parentCommentId: faker.string.uuid(),
    post: belongsTo('post'),
    commentByUser: belongsTo('userProfile'),
    parentComment: belongsTo('postComment'),
    childComments: hasMany('postComment'),
    replies: hasMany('replies'),
  }),

  likedPost: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    postId() {
      return faker.string.uuid();
    },
    userId() {
      return faker.string.uuid();
    },
    post: belongsTo('post'),
    user: belongsTo('userProfile'),
  }),

  messages: Factory.extend({
    id() {
      return faker.string.uuid();
    },
  }),

  follower: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    followingUserId() {
      return faker.string.uuid();
    },
    followeeUserId() {
      return faker.string.uuid();
    },
    followingUser: belongsTo('userProfile'),
    followedUser: belongsTo('userProfile'),
  }),

  bookmarkCategory: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    title() {
      return faker.lorem.words(3);
    },
    description() {
      return faker.lorem.sentence();
    },
    userId() {
      return faker.string.uuid();
    },
    user: belongsTo('userProfile'),
    bookmark: hasMany('bookmark'),
  }),

  bookmark: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    bookmarkCategoryId() {
      return faker.string.uuid();
    },
    postId() {
      return faker.string.uuid();
    },
    bookmarkCategory: belongsTo('bookmarkCategory'),
    post: belongsTo('post'),
  }),

  replies: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    userId() {
      return faker.string.uuid();
    },
    commentId() {
      return faker.string.uuid();
    },
    postId() {
      return faker.string.uuid();
    },
    user: belongsTo('userProfile'),
    comment: belongsTo('postComment'),
    post: belongsTo('post'),
  }),

  userJoinedCommunity: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    userId() {
      return faker.string.uuid();
    },
    communityId() {
      return faker.string.uuid();
    },
    position: faker.number.int(),
    user: belongsTo('userProfile'),
    community: belongsTo('community'),
  }),

  threadPostsMapping: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    threadId() {
      return faker.string.uuid();
    },
    postId() {
      return faker.string.uuid();
    },
    thread: belongsTo('thread'),
    post: belongsTo('post'),
  }),

  post: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    caption() {
      return faker.lorem.sentence();
    },
    creatorId() {
      return faker.string.uuid();
    },
    commentsCount: faker.number.int(),
    viewCount: faker.number.int(),
    likesCount: faker.number.int(),
    repostCount: faker.number.int(),
    createdAt() {
      return faker.date.past();
    },
    updatedAt() {
      return faker.date.between({ from: faker.date.past(), to: new Date() });
    },
    repliesAllowedBy: faker.helpers.arrayElement([
      'everyone',
      'accounts_you_follow',
      'only_accounts_you_mention',
    ]),
    published: faker.datatype.boolean(),
    scheduleAt() {
      return faker.date.future();
    },
    positionNumber: faker.number.int(),
    active: faker.datatype.boolean(),
    likedPost: hasMany('likedPost'),
    postComments: hasMany('postComment'),
    bookmarks: hasMany('bookmark'),
    threadPostsMapping: hasMany('threadPostsMapping'),
    replies: hasMany('replies'),
    creator: belongsTo('userProfile'),
  }),

  postPoll: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    postId() {
      return faker.string.uuid();
    },
    endsOn() {
      return faker.date.future();
    },
    post: belongsTo('post'),
    postChoice: hasMany('postChoice'),
  }),

  postChoice: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    postPollId() {
      return faker.string.uuid();
    },
    title() {
      return faker.lorem.words(3);
    },
    selectedCount: faker.number.int(),
    postPoll: belongsTo('postPoll'),
  }),

  postMedia: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    postId() {
      return faker.string.uuid();
    },
    mediaType: faker.helpers.arrayElement([
      'image',
      'video',
      'audio',
      'document',
    ]),
    tags() {
      return faker.lorem.words(3);
    },
    alt() {
      return faker.lorem.words(3);
    },
    originalMediaUrl() {
      return faker.image.url();
    },
    modifiedMediaUrl() {
      return faker.image.url();
    },
    creatorId() {
      return faker.string.uuid();
    },
    post: belongsTo('post'),
    creator: belongsTo('userProfile'),
  }),

  notification: Factory.extend({
    id() {
      return faker.string.uuid();
    },
    type() {
      return faker.lorem.word();
    },
    referenceId() {
      return faker.string.uuid();
    },
  }),
};
