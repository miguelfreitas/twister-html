twister-html
============

HTML interface for [Twister](http://twister.net.co) [(github)](https://github.com/miguelfreitas/twister-core).
To use it, clone this repo under ~/.twister/html like this:

    git clone https://github.com/miguelfreitas/twister-html.git ~/.twister/html
    
If you'r on **Mac OS X** - clone to ${HOME}/Library/Application\ Support/Twister/html instead of ~/.twister/html

Contribute
----------

Feel free to fork and send pull requests!

To make it easier for us to accept your patches, please follow the conventional GitHub workflow:

     # after forking, clone your repo
     rm -rf ~/.twister/html
     git clone git@github.com:yournickname/twister-html.git ~/.twister/html
     cd ~/.twister/html
     # CREATE A NEW BRANCH, specific to the fix you're implementing
     git checkout -b my-fix
     # ... make your changes ...
     # commit and push
     git commit -m "Fixing #1234 - bad foobarizer" && git push
     # Now open a pull request from branch my-fix to miguelfreitas:master on github.
     # Once the request is accepted, switch back to master and track upstream
     git remote add upstream https://github.com/miguelfreitas/twister-html.git # one-off setup
     git fetch upstream
     git checkout master
     git merge upstream/master # you should get a fast-forward message here
     git push

Translations
------------

If you want to add your own translation, edit `interface_localization.js` like this:

1. fork the repo and create a new branch

        git clone git@github.com:yournickname/twister-html.git ~/.twister/html
        cd ~/.twister/html
        git checkout -b Klingon

2. add your language to the list of available choices. You should use your ISO code here,
it should match what the browser reports. The Klingon ISO is "tlh", so:


        var knownLanguages = ["en","nl","it","fr","ru","tlh"];`
    
For multi-region languages, if you want to catch them all, use only the first half 
(e.g. to match it and it-ch, specify "it").

3. add a new wordset block after  existing ones


        if(preferredLanguage == "tlh"){
            polyglot.locale("tlh");
            wordset = {
                "Insults": "mu'qaD,
                ....
            }
        }

4. stage all changes in file `interface_localization.js` 


        git add interface_localization.js
        
5. commit & push


        git commit -m "Klingon translation"
        git push   
 
3. When opening the pull request on github. For any help, ping @toyg.
