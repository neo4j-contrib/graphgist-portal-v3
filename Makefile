deploy:
	git branch -D heroku-web
	git subtree split --prefix ui-react -b heroku-web
	git push heroku-web heroku-web:master --force
	git branch -D heroku-api
	git subtree split --prefix api -b heroku-api
	git push heroku-api heroku-api:master --force

deploy-api:
	git branch -D heroku-api
	git subtree split --prefix api -b heroku-api
	git push heroku-api heroku-api:master --force

deploy-web:
	git branch -D heroku-web
	git subtree split --prefix ui-react -b heroku-web
	git push heroku-web heroku-web:master --force
