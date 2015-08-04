Before deploying this app to Heroku or pushing ANY code to github, take note of
the following:
- If the deployed app is not working, it may be because the proper environment 
  variables are not set. Try running `. ./heroku_config.sh` and then deploying
  the app.
- You are NOT to add an unencrypted version of heroku_config.sh to the git 
  repository. ALWAYS encrypt this file and add the encrypted version to the
  repository.
- If you do not have the password to decrypt the file, check the google drive
  folder and then run `make decrypt_config` to generate heroku_config.sh
