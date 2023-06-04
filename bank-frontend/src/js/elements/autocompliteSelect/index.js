import autocomplete from "autocompleter";

let autocompleteSelect = null;
let input = null;
let suggestionsArray = null;
let recipientArray = null

function initAutoCompliteSelect(selectSelector) {
  input = document.querySelector(selectSelector);
  recipientArray = JSON.parse(window.localStorage.getItem('recipientHistory'));
  suggestionsArray = recipientArray.map((item) => {
    return {label: String(item), value: String(item)};
  });

  autocompleteSelect = autocomplete({
    input: input,
    fetch: function(text, update) {
      text = text.toLowerCase();
      var suggestions = suggestionsArray.filter(n => n.label.toLowerCase().startsWith(text))
      update(suggestions);
    },
    onSelect: function(item) {
      input.value = item.label;
    }
  })
}

function refreshAutocompleteSelect() {
  recipientArray = JSON.parse(window.localStorage.getItem('recipientHistory'));
  suggestionsArray = recipientArray.map((item) => {
    return {label: String(item), value: String(item)};
  });
  autocompleteSelect.fetch;
}

export { initAutoCompliteSelect, refreshAutocompleteSelect }