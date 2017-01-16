import config from './config';

function jsonToQueryString(json) {
  return '?' +
    Object.keys(json).map(function(key) {
        return encodeURIComponent(key) + '=' +
          encodeURIComponent(json[key]);
    }).join('&');
}

const fetchOptions = () => {
  const token = config.apiAi.token;

  return ({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    redirect: 'follow',
  });

}

export default class AIClient {
  constructor(sessionId){

    this.baseURL = "https://api.api.ai/v1";
    this.fetchOptions = fetchOptions();
    this.bodyExtras = {
      lang: 'en',
      sessionId: sessionId,
      v: "20150910"
    };

    this.queryStringExtras = jsonToQueryString(this.bodyExtras);
  }

  get(url, queryString){
    return fetch(
      `${url}?${queryString}&${this.queryStringExtras}`,
      {...this.fetchOptions, method: "get" }
     ).then((response) => response.json());
  }

  post(url, body){
    const fullBody = Array.isArray(body) ? body : { ...body, ...this.bodyExtras };
    const fullURL = url + this.queryStringExtras;

    return fetch(fullURL,
      { ...this.fetchOptions, method: 'post', body: JSON.stringify(fullBody) }
    ).then((response) => response.json());
  }

  del(url){
    const fullURL = url + this.queryStringExtras;

    return fetch(fullURL,
      {...this.fetchOptions, method: "delete" }
    ).then((response) => response.json());
  }

  sendMessage(message, contexts){
    const body = {
      "query": message,
      // "contexts": contexts,
    };

    let promise = this.post(`${this.baseURL}/query`, body);

    return promise
      .then((response) => response.result)
      .catch((error) => error);
  }

  getContexts(){
    let promise = this.get(`${this.baseURL}/contexts`, "z=0");

    return promise
      .then((response) => response)
      .catch((error) => error);
  }

  setContexts(contexts){
    let promise = this.post(`${this.baseURL}/contexts`, contexts);

    return promise
      .then((response) => response)
      .catch((error) => error);
  }

  deleteContexts(context){
    let url = `${this.baseURL}/contexts`;
    url += (!context) ? "" : `/${context}`;

    let promise = this.del(url);

    return promise
      .then((response) => response)
      .catch((error) => error);
  }

  addUserEntities(entities){
    const body = { entities: Array.isArray(entities) ? entities : [entities] }
    let promise = this.post(`${this.baseURL}/userEntities`, body);

    return promise
    .then((response) => response)
    .catch((error) => error);
  }
}
