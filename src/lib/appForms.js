module.exports = (function() {
	var forms = require('forms'),
		fields = forms.fields,
		validators = forms.validators;

	return {
		login: forms.create({
			email: fields.email({
				required: true
			}),

			password: fields.password({
				required: true
			})
		}),

		signup: forms.create({
			email: fields.email({
				required: true
			}),

			characterName: fields.string({
				required: true
			}),

			password: fields.password({
				required: true
			}),

			confirmPassword: fields.password({
				required: true,
				validators: [
					validators.matchField('password')
				]
			})
		})
	}
})();