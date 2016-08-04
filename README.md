twister-html
============

HTML interface for **[twister](http://twister.net.co)** (see git repo [here](https://github.com/miguelfreitas/twister-core)). It is a FOSS which is being under heavy construction.

To use it, clone this repo under `~/.twister/html` like this:

    git clone https://github.com/miguelfreitas/twister-html.git ~/.twister/html

If you're on **Mac OS X** — clone to `${HOME}/Library/Application\ Support/Twister/html` instead of `~/.twister/html`

Be on the bleeding edge
-----------------------

All nightly improvements and following fixes of these improvements are tested in [blaster](https://github.com/miguelfreitas/twister-html/tree/blaster) branch.
To be sure you are at the forefront, in stage of lack of testing and consensus:

    git pull && git checkout blaster

If you want to switch back to stable branch:

    git checkout master

Follow `@letstwist` in twister to be aware of recent changes. In case of getting of twister-html related buzz from it:

    git pull


Contribute
----------

Feel free to fork and send pull requests!

To make it easier for us to accept your patches, please follow the conventional GitHub workflow
and keep in mind that your pull requests should have **blaster** branch as both the origin and target.

1. After forking, clone your repo:

        rm -rf ~/.twister/html  # in case you already have it cloned from not your repo
        git clone git@github.com:YOURNICKNAME/twister-html.git ~/.twister/html
        cd ~/.twister/html

2. Switch to 'blaster' branch:

        git checkout blaster

3. CREATE A NEW BRANCH, specific to the fix you're implementing:

        git checkout -b my-awesome-fix

4. Make your changes.

5. Commit and push:

        git commit -m "fix of #12345: bad foobarizer" && git push

6. Now open a pull request from branch 'YOURNICKNAME:my-awesome-fix' to 'miguelfreitas:blaster' on GitHub.

7. Once the request is accepted, switch back to 'blaster' and track changes in upstream repo:

        git remote add upstream https://github.com/miguelfreitas/twister-html.git  # this is one-off setup
        git fetch upstream && git checkout blaster
        git merge upstream/blaster  # you should get a fast-forward message here
        git push

Translations
------------

If you want to add your own translation, edit `interface_localization.js` like this:

1. Fork the repo and create a new branch from 'blaster' one:

        git clone git@github.com:YOURNICKNAME/twister-html.git ~/.twister/html
        cd ~/.twister/html && git checkout blaster
        git checkout -b Klingon-translation

2. Add your language to the list of available choices. You should use your ISO code here,
it should match what the browser reports. The Klingon ISO is 'tlh', so:

        var knownLanguages = ['en', 'nl', 'it', 'fr', ... , 'ru', 'tlh'];

For multi-region languages, if you want to catch them all, use only the first half
(e.g. to match it and it-ch, specify 'it').

3. Add a new wordset block after existing ones:

        if (preferredLanguage === 'tlh') {
            polyglot.locale('tlh');
            wordset = {
                'Insults': 'mu\'qaD',
                ...
            }
        }

4. Stage all changes in file `interface_localization.js`:

        git add interface_localization.js

5. Commit & push:

        git commit -m 'Klingon translation'
        git push origin Klingon-translation

6. Then open the pull request from branch 'YOURNICKNAME:Klingon-translation' to 'miguelfreitas:blaster' on GitHub.

For any help ping `@tasty` in twister.
