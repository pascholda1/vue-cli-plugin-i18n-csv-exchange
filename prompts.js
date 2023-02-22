module.exports = pkg => {
	
	return [
		{
			type: 'input',
			name: 'jsonDir',
			message: 'The src directory where your localization JSON files are stored?',
			default: './src/locales'
		},
		{
			type: 'input',
			name: 'csvDir',
			message: 'The target directory for your CSV files',
			default: "./localizations"
		},
	]
}
