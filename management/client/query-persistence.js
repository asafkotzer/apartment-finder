export function save(query) {

};

export function load() {
  return fetch('/query').then(response => response.json())
};
