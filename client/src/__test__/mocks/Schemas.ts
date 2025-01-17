import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import {
  IPostMedia,
  IMediaType,
  IUser,
  IGender,
  IAuthProvider,
  IUserSession,
  ISchemaPost,
} from '@/utils/interfaces';

export const UserSchema = Factory.extend<IUser>({
  id() {
    return faker.string.alphanumeric(20);
  },
  full_name() {
    return faker.person.fullName();
  },
  last_name() {
    return faker.person.lastName();
  },
  first_name() {
    return faker.person.firstName();
  },
  signup_date() {
    return faker.date.past().toDateString();
  },
  email() {
    return faker.internet.email();
  },
  password() {
    return faker.internet.password();
  },
  auth_provider() {
    return faker.helpers.arrayElement([
      IAuthProvider.GITHUB,
      IAuthProvider.LOCAL,
      IAuthProvider.GOOGLE,
    ]);
  },
  email_verified() {
    return faker.datatype.boolean();
  },
  profile_img() {
    return faker.image.avatarGitHub();
  },
  username() {
    return faker.internet.userName().toLowerCase();
  },
  gender() {
    return faker.helpers.arrayElement([IGender.FEMALE, IGender.MALE]);
  },
  date_of_birth() {
    return faker.date.past().toISOString();
  },
  location() {
    return faker.location.city();
  },
  banner_img() {
    return faker.image.urlPicsumPhotos({ width: 1920, height: 1080 });
  },
  bio() {
    return faker.lorem.sentence();
  },
});

export const UserTokensSchema = Factory.extend({
  id() {
    return faker.string.alphanumeric(20);
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
});

export const PostSchema = Factory.extend<ISchemaPost>({
  id() {
    return faker.string.alphanumeric(20);
  },
  caption() {
    return faker.lorem.sentences({ min: 1, max: 4 });
  },
  likes_count() {
    return faker.number.int({ max: 1000 });
  },
  liked() {
    return faker.datatype.boolean();
  },
  created_on() {
    return faker.date.past().toDateString();
  },
  updated_on() {
    return faker.date.past().toDateString();
  },
  bookmarked() {
    return faker.datatype.boolean();
  },
  timeAgo() {
    return '2h';
  },
  comments_count() {
    return faker.number.int({ max: 1000 });
  },
});

export const MediaSchema = Factory.extend<IPostMedia>({
  id() {
    return faker.string.alphanumeric(20);
  },
  media_type() {
    return faker.helpers.arrayElement([
      IMediaType.AUDIO,
      IMediaType.DOCUMENT,
      IMediaType.IMAGE,
      IMediaType.VIDEO,
    ]);
  },
  tags() {
    return faker.lorem.words();
  },
  alt() {
    return faker.lorem.sentence();
  },
  original_media_url() {
    return faker.image.urlPicsumPhotos();
  },
  modified_media_url() {
    return faker.image.urlPicsumPhotos();
  },
});

export const UserSessionSchema = Factory.extend<IUserSession>({
  id() {
    return faker.string.alphanumeric(20);
  },
  device_name() {
    return faker.helpers.arrayElement([
      'mobile',
      'tablet',
      'desktop',
      'laptop',
      'smartphone',
    ]);
  },
  browser() {
    return faker.helpers.arrayElement([
      'chrome',
      'firefox',
      'safari',
      'opera',
      'edge',
      'brave',
      'vivaldi',
      'ie',
    ]);
  },
  location() {
    return faker.location.city();
  },
  ip_address() {
    return faker.internet.ip();
  },
  os() {
    return faker.helpers.arrayElement([
      'windows',
      'linux',
      'macos',
      'android',
      'ios',
    ]);
  },
  last_logged_in_date() {
    return faker.date.past().toDateString();
  },
  logged_in() {
    return faker.datatype.boolean();
  },
  logged_in_date() {
    return faker.date.past().toDateString();
  },
});
