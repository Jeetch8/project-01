import neo4j, { Driver } from 'neo4j-driver';
import { faker } from '@faker-js/faker';

const getString = (obj: any) => {
  let str = '';
  Object.entries(obj).forEach((el) => {
    str += `${el[0]}: ${typeof el[1] === 'boolean' ? `${el[1]}` : `'${el[1]}'`},`;
  });
  if (str.endsWith(',')) str.slice(0, -1);
  return str;
};

const createUsers = async (connection: Driver) => {
  const user = async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      first_name: firstName,
      last_name: lastName,
      full_name: firstName + ' ' + lastName,
      profile_img: faker.image.avatar(),
      username: faker.internet.userName(),
      signup_date: new Date().toISOString(),
      email_verified: true,
      email: faker.internet.email(),
      password: faker.internet.password(),
      auth_provider: 'local',
      gender: faker.helpers.arrayElement(['male', 'female']),
    };
  };
  for (let i = 0; i < 1; i++) {
    const str = getString(await user());
    await connection.executeQuery(`CREATE {${str}}`);
  }
};

const createPosts = async () => {};

const init = async () => {
  const URI = 'asdasd';
  const USER = '';
  const PASSWORD = '';
  let driver: Driver;

  try {
    driver = await neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    await createUsers(driver);
  } catch (error) {
    console.log(`err: ${error}, cause of error: ${error.cause}`);
  }
};
