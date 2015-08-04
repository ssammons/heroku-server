.PHONY: _pwd_prompt encrypt_config decrypt_config

CONFIG_FILE=heroku_config.sh

_pwd_prompt:
	@echo "Check the google drive folder for the encryption password"

encrypt_config: _pwd_prompt
	openssl des3 -in ${CONFIG_FILE} -out ${CONFIG_FILE}.des3

decrypt_config: _pwd_prompt
	openssl des3 -d -in ${CONFIG_FILE}.des3 -out ${CONFIG_FILE}