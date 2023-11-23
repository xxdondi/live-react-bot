export function fromBase64JsonToObject(base64json: string) {
  return JSON.parse(atob(base64json));
}

export function parseParams(queryString: string) {
  var query: object = {};
  var pairs = (
    queryString[0] === "?" ? queryString.substr(1) : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    // @ts-expect-error
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}
