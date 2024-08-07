import { red, yellow, cyan, magentaBright } from 'ansis';
import { userInput, pickObjectKeys } from './helper/helper.js';

import Github from './lib/github.js';
import Gemini from './lib/gemini.js';

// i'll go with native env reader.
// run: node --env-file=.env index.js
// if it does not work, uncomment 2 lines below
// import dotenv from 'dotenv'
// dotenv.config()

async function getUserDetails(username) {
  const user = await Github.getUser({ username });
  if (!user) {
    return null;
  }

  const data = pickObjectKeys(user, [
    'name',
    'bio',
    'company',
    'location',
    'followers',
    'following',
    'created_at',
    'updated_at',
    'public_repos',
  ]);
  return data;
}

async function getUserRepos(username, limit = 20) {
  const repos = await Github.getRepoList({ username });
  if (!repos) {
    return null;
  }

  const data = repos
    .map((repo) => {
      return pickObjectKeys(repo, [
        'name',
        'description',
        'language',
        'fork',
        'stargazers_count',
        'open_issues_count',
        'forks_count',
        'created_at',
        'updated_at',
      ]);
    })
    .slice(0, Number(limit));

  return data;
}

async function getReadmeFile(username) {
  const readmeFile = [
    ...(await Promise.allSettled([
      Github.getRepoFile({
        username,
        repo: username,
        branch: 'main',
        file: 'README.md',
      }),
      Github.getRepoFile({
        username,
        repo: username,
        branch: 'master',
        file: 'README.md',
      }),
      Github.getRepoFile({
        username,
        repo: username,
        branch: 'main',
        file: 'readme.md',
      }),
      Github.getRepoFile({
        username,
        repo: username,
        branch: 'master',
        file: 'readme.md',
      }),
    ])),
  ].find((file) => file.status == 'fulfilled');

  if (!readmeFile) {
    return null;
  }

  return readmeFile.value;
}

async function getTotalContribs(username) {
  const contributions = await Github.getContributions({ username });
  if (!contributions) {
    return 0;
  }

  return (
    contributions.match(
      /[\d,]+(?=\s*contributions\s+in\s+the\s+last\s+year)/gi
    )[0] ?? 0
  );
}

function getResultLanguage() {
  const flag = process.argv.indexOf('--lang');

  let lang = 'english';
  if (flag > -1) {
    lang = process.argv[flag + 1];
  }

  return lang;
}

async function enterUsername() {
  const username = await userInput('Enter your Github username: ');

  if (!username) {
    console.log(red`Error: Please enter your Github username`);
    return await enterUsername();
  }

  return username;
}

function showBanner() {
  console.log(magentaBright`------------------------------------------
Github Roast CLI 1.0
by Rifqi Haidar <github.com/erhaem> - 2024
------------------------------------------
`);
}

async function run() {
  showBanner();

  const { GITHUB_TOKEN, GEMINI_API_KEY } = process.env;

  if (!GITHUB_TOKEN) {
    console.log(red`Error: Please set your Github Token at .env`);
    process.exit(0);
  }

  if (!GEMINI_API_KEY) {
    console.log(red`Error: Please set your Gemini API key at .env`);
    process.exit(0);
  }

  Github.setAuthToken(GITHUB_TOKEN);

  const username = await enterUsername();
  // console.log('username => ', username);

  console.log(cyan`Getting user details..`);

  const user = await getUserDetails(username);
  // console.log('data user => ', user);
  console.log(cyan`Getting user contributions..`);
  user.yearly_contributions = await getTotalContribs(username);

  console.log(cyan`Getting user repos..`);
  user.repositories = await getUserRepos(username);

  console.log(cyan`Getting user readme.md..`);
  const readme = await getReadmeFile(username);

  const lang = getResultLanguage();

  //TODO(prompt): need some tweak
  const prompt = `Give this Github user an extremely-harsh roasting in short, no advices and praises allowed, your response language is based on their location/language (default: ${lang}). Here is the details: ${JSON.stringify(
    user
  )} and their profile markdown: ${readme} (ignore null). No text-formatting like bold, italic, or alike`;

  // console.log('PROMPT => ', prompt);

  console.log(cyan`Finishing..`);
  Gemini.setModelInstance(GEMINI_API_KEY);
  const chat = await Gemini.generateContent(prompt);

  //TODO: give some colors :))
  console.log(`
Result:
${chat.trim()}`);
}

run();
