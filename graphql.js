const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fetch = require('node-fetch');
const { cache, cacheSrandmember, cacheSadd, expire } = require('./redis');

const serverUrl = 'http://localhost:12276';
// const serverUrl = 'http://8.135.66.238:12276';

const schema = buildSchema(`
  type Query {
    completions: [Question]
    exam(id: ID): [Question]
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

const findOneCompletion = (id) => {
  const action = () => fetch(`${serverUrl}/completions/${id}`).then(res => res.json());
  return cache(`question::${id}`, action, 3600);
};

const root = {
  completions: () => fetch(`${serverUrl}/completions`)
    .then(res => res.json())
    .then(json => json.map(c => ({
      ...c,
      correct: () => fetch(`${serverUrl}/completion_correct?completionId=${c.id}`).then(res => res.json()),
      audio: () => fetch(`${serverUrl}/completion_audios?completionId=${c.id}`).then(res => res.json()),
    }))),
  exam: ({ id }) => {
    const count = 10;
    return cacheSrandmember(`exam::${id}`, count)
      .then(cacheIds => {
        if (cacheIds.length > 0) {
          return cacheIds;
        }
        return fetch(`${serverUrl}/exams/${id}`)
          .then(res => res.json())
          .then(exam => {
            exam.questions.map(v => cacheSadd(`exam::${id}`, v.questionId));
            expire(`exam::${id}`, 3600);
            return exam.questions.map(v => v.questionId);
          });
      })
      .then(questionIds => Promise.all(questionIds.map(findOneCompletion)));
  },
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(61227, () => console.log('DONE'));
