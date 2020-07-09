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
    regex.push(str[element.lastLine - 1]);
  });
  fetchGrammar(regex);
  displayResultsHTML(regex, responseJSON);
}
function highlightGrammarRegex(grammarJSON, regex) {
  grammarJSON.errors.forEach((error) => {
    regex.push(error.bad);
  });
  highlight(regex);
  displayResultsHTML(regex, grammarJSON);
}
function resultsHTML(str, type, disc) {
  return (
    `<div class="error"><ul><li>` +
    str +
    `</li><li>` +
    type +
    `</li><li>` +
    disc +
    `</li></ul></div>`
  );
}
function resultsGrammar(str, type, disc) {
  return (
    `<div class="errors"><ul><li>` +
    str +
    `</li><li>` +
    type +
    `</li><li>` +
    disc +
    `</li></ul></div>`
  );
}
function displayResultsHTML(regex, responseJSON) {
  let i = 0;
  if (responseJSON.need === 'html') {
    $('div.error').remove();
    responseJSON.messages.forEach((response) => {
      let printRegex = regex[i].replace(/[<>]/gm, '');
      if (response.type == 'error') {
        $('#corrections').after(
          resultsHTML(printRegex, response.type, response.message)
        );
      } else
        $('#corrections').after(
          resultsHTML(printRegex, response.subType, response.message)
        );
      i++;
    });
  }
  if (responseJSON.need === 'grammar') {
    $('div.errors').remove();
    responseJSON.errors.forEach((error) => {
      $('#corrections').after(
        resultsGrammar(error.bad, error.type, error.better)
      );
    });
  }
}
function handleForm() {
  formSubmit();
}
$(handleForm);
