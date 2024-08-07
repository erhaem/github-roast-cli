import ApiWrapper from './apiwrapper.js';

const Github = (() => {
  const baseWebURL = 'https://github.com';
  const baseApiURL = 'https://api.github.com';
  const rawContentURL = 'https://raw.githubusercontent.com';

  const httpHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const setAuthToken = (token) => {
    httpHeaders['Authorization'] = `token ${token}`;
  };

  const getloggedUser = async () => {
    const headers = { ...httpHeaders };
    return ApiWrapper.fetchApi({
      baseURL: baseApiURL,
      endpoint: '/user',
      headers,
    });
  };

  const getUser = async ({ username }) => {
    const headers = { ...httpHeaders };
    return ApiWrapper.fetchApi({
      baseURL: baseApiURL,
      endpoint: `/users/${username}`,
      headers,
    });
  };

  const getRepoList = async ({ username, sort = 'updated' }) => {
    const headers = { ...httpHeaders };
    return ApiWrapper.fetchApi({
      baseURL: baseApiURL,
      endpoint: `/users/${username}/repos?sort=${sort}`,
      headers,
    });
  };

  const getRepoFile = async ({ username, repo, branch = 'main', file }) => {
    return ApiWrapper.fetchApi({
      baseURL: rawContentURL,
      endpoint: `/${username}/${repo}/${branch}/${file}`,
    });
  };

  const getContributions = async ({ username }) => {
    return ApiWrapper.fetchApi({
      baseURL: baseWebURL,
      endpoint: `/users/${username}/contributions`,
    });
  };

  return {
    setAuthToken,
    getloggedUser,
    getUser,
    getRepoList,
    getRepoFile,
    getContributions,
  };
})();

export default Github;
