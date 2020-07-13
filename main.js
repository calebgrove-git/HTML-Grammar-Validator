'use strict';

import { highlight } from './jquery.highlight-within-textarea.js';

function formSubmit(e) {
  $('input#formSubmit').click('#formSubmit', function (e) {
    e.preventDefault();
    $('#corrections').removeClass('hidden');
    fetchValid();
  });
}
function fetchValid() {
  let html = $('form textarea').val();
  let str = '' + html + '';
  str = str.split(/\n/gm);
  fetch('https://validator.nu/?out=json&showsource=yes&checkerrorpages=yes', {
    method: 'post',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((responseJSON) => {
      responseJSON.need = 'html';
      highlightRegex(responseJSON, str);
    })
    .catch((error) => console.log(error));
}
function fetchGrammar(regex) {
  let html = $('form textarea').val();
  $('#hiddenFile').append(html);
  html = $('#hiddenFile').text();
  $('#hiddenFile').empty();
  html = html.match(/[^\s]+/gm);
  html = html.join('+');
  fetch(
    'https://api.textgears.com/check.php?text=' +
      html +
      '!&key=639YgypA8aXmSodU'
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((grammarJSON) => {
      (grammarJSON.need = 'grammar'), highlightGrammarRegex(grammarJSON, regex);
    })
    .catch((error) => console.log(error));
}
function highlightRegex(responseJSON, str) {
  let regex = [];
  responseJSON.messages.forEach((element) => {
    let obj = {};
    if (element.type === 'error') {
      obj.highlight = str[element.lastLine - 1];
      obj.className = 'red';
    }
    if (element.type === 'info') {
      obj.highlight = str[element.lastLine - 1];
      obj.className = 'purple';
    }
    regex.push(obj);
  });
  fetchGrammar(regex);
  displayResultsHTML(regex, responseJSON);
}
function highlightGrammarRegex(grammarJSON, regex) {
  console.log(grammarJSON);
  grammarJSON.errors.forEach((error) => {
    let obj = {};
    if (error.type === 'spelling') {
      obj.highlight = error.bad;
      obj.className = 'green';
    }
    if (error.type === 'grammar') {
      obj.highlight = error.bad;
      obj.className = 'blue';
    }
    regex.push(obj);
  });
  console.log(regex);
  highlight(regex);
  displayResultsHTML(regex, grammarJSON);
}
function resultsHTML(name, str, type, disc) {
  return (
    `<div class="error"><ul><li>` +
    str +
    `</li><hr><li class="` +
    name +
    `">` +
    type +
    `</li><hr><li>` +
    disc +
    `</li></ul></div>`
  );
}
function resultsGrammar(name, str, type, disc) {
  return (
    `<div class="errors"><ul><li>` +
    str +
    `</li><hr><li class="` +
    name +
    `">` +
    type +
    `</li><hr><li> suggestion: ` +
    disc +
    `</li></ul></div>`
  );
}
function displayResultsHTML(regex, responseJSON) {
  let i = 0;
  console.log(responseJSON);
  if (responseJSON.need === 'html') {
    $('div.error').remove();
    responseJSON.messages.forEach((response) => {
      let printRegex = regex[i].highlight.replace(/[<>]/gm, '');
      if (response.type == 'error') {
        $('#corrections').after(
          resultsHTML('red', printRegex, response.type, response.message)
        );
        console.log(printRegex);
      } else
        $('#corrections').after(
          resultsHTML('purple', printRegex, response.subType, response.message)
        );
      i++;
    });
  }
  if (responseJSON.need === 'grammar') {
    $('div.errors').remove();
    responseJSON.errors.forEach((error) => {
      if (error.type === 'grammar') {
        $('#corrections').after(
          resultsGrammar('blue', error.bad, error.type, error.better)
        );
      } else
        $('#corrections').after(
          resultsGrammar('green', error.bad, error.type, error.better)
        );
    });
  }
  $('form:first-child').addClass('blur');
  $('form textarea').removeClass('blur');
}
function handleForm() {
  formSubmit();
}
$(handleForm);
