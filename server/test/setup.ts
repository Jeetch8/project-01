// import { Neo4jContainer, StartedNeo4jContainer } from '@testcontainers/neo4j';
// import { Wait } from 'testcontainers';

// const init = async () => {
//   console.log('Setup file running');
//   const neoContainer = await new Neo4jContainer('neo4j:latest')
//     .withWaitStrategy(Wait.forLogMessage('Started!'))
//     .start();
//   console.log('test1');

//   global.neo4j = neoContainer;
//   console.log('test2');

//   process.env.NODE_ENV = 'test';
//   process.env.NEO4J_DB_USERNAME = neoContainer.getUsername();
//   process.env.NEO4J_DB_PASSWORD = neoContainer.getPassword();
//   process.env.NEO4J_DB_PORT = neoContainer.getMappedPort(7687).toString();
//   process.env.NEO4J_DB_HOST = neoContainer.getHost();
//   process.env.NEO4J_DB_SCHEME = 'neo4j';
//   console.log('test3');
// };

// export default init;

const init = async () => {
  console.log('Setup file running');
};
export default init;
