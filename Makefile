deploy-staging:
	make deploy-staging-api
	make deploy-staging-web

deploy-staging-api:
	git checkout -B heroku-api
	git branch -D heroku-api
	git subtree split --prefix api -b heroku-api
	git push heroku-api heroku-api:master --force

deploy-staging-web:
	git checkout -B heroku-web
	git branch -D heroku-web
	git subtree split --prefix ui-react -b heroku-web
	git push heroku-web heroku-web:master --force

deploy-production:
	make deploy-production-api
	make deploy-production-web

deploy-production-api:
	git branch --force heroku-production-api
	git branch -D heroku-production-api
	git subtree split --prefix api -b heroku-production-api
	git push heroku-production-api heroku-production-api:master --force

deploy-production-web:
	git branch --force heroku-production-web
	git branch -D heroku-production-web
	git subtree split --prefix ui-react -b heroku-production-web
	git push heroku-production-web heroku-production-web:master --force
