# Vue CLI Plugin i18n CSV exchange

This plugin can export nested localization JSON files to CSV and import CSV localization files back to JSON.

## Installation

````shell
npm i --save-dev @pascholda1/vue-cli-plugin-i18n-csv-exchange 
vue invoke vue-cli-plugin-i18n-csv-exchange
````

## Usage

To create / update CSV files based on your JSON files:

````shell
npm run i18n-export-csv
````

To create / update JSON files based on your CSV files:

````shell
npm run i18n-import-csv
````

## Examples

### i18n-export-csv

reads nested JSON Files like:

`````json
{
	"questions": {
		"answer": {
			"yes": "Yes",
			"no": "No"
		}
	}
}
`````

will create a CSV like:

```csv
questions.answer.yes,Yes
questions.answer.no ,No
```

### i18n-import-csv

reads a CSV File like that:

```csv
questions.answer.yes,Yes
questions.answer.no ,No
```

and adds the second column's values to the first column's object path.
