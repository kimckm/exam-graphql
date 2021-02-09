const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fetch = require('node-fetch');

const serverUrl = 'http://localhost:12276';

const schema = buildSchema(`
  type Query {
    completions: [Question]
  }

  type Question {
    id: ID
    question: String
    createAt: String
    correct: [Correct]
    audio: [Audio]
  }

  type Correct {
    code: String
    expected: String
  }

  type Audio {
    name: String
    src: String
  }
`);

const root = {
  completions: () => fetch(`${serverUrl}/completions`)
    .then(res => res.json())
    .then(json => json.map(c => ({
      ...c,
      correct: () => fetch(`${serverUrl}/completion_correct?completionId=${c.id}`).then(res => res.json()),
      audio: () => fetch(`${serverUrl}/completion_audios?completionId=${c.id}`).then(res => res.json()),
    }))),
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(61227, () => console.log('Now browse to localhost:61227/graphql'));
