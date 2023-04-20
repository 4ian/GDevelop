# Using git to make and propose changes to GDevelop

GDevelop source code is hosted on GitHub, which is based on the Git version control system to handle the code source. While git can be a bit hard to learn when you're first using it, it's actually not complicated once you have a few concepts in mind. It's also very powerful.

> If you have never used GitHub, you may first want to go on [GDevelop GitHub](https://github.com/4ian/GDevelop), and click on **Fork** to get a copy of the GDevelop source code. This will be "your" copy of the source code, where you can create new features and open **Pull Requests**, which are proposal of changes to the source code - most of the time to implement new features or fix bugs.

## 1. Cloning the repository

If it's the first time and you have just "forked" GDevelop on GitHub, clone your repository: `git clone git@github.com:your-username/GDevelop.git`. This will download your copy of the repository on your local computer.

- Your own repository is usually called, in git jargon, a "remote" repository, named `origin`. When you do a `git push`, `git pull`, your usually, unless specified otherwise, getting or sending code to your repository.
- The [GDevelop "official repository"](https://github.com/4ian/GDevelop) is also a remote, usually called `upstream`.

By default, when you have just "cloned" your repository, there is only the single remote `origin`. It will be useful later to have the `upstream` remote (to get the latest code from GDevelop). You can do it by entering: `git remote add upstream https://github.com/4ian/GDevelop.git`.

> Not using the **command line?**. This quick guide is written for someone using the Git command line. It can be easier to start with a git client like GitHub Desktop, GitKraken.com, Tortoise Git, SourceTree, or [another GUI client](https://git-scm.com/downloads/guis). This being said, **the workflow** explained here is still valid.

## 2. Learn about the `master` branch, branches and Pull Requests

In git, all the code is stored in the repository, and changes are stored in *commits*. The latest version of the source code is in a "branch", which is called `master` (it's an arbitrary convention).

When you'll make new additions to GDevelop, you'll make a new "branch". Imagine a branch like the branch of a tree:

- The source code is in master, which is the trunk of the tree, with tons of commits.
- Your branch will grow from master, adding a few commits.
- You can open a [Pull Request](https://help.github.com/en/articles/creating-a-pull-request) to propose the changes made on your branch.
- If your changes are accepted, they will get *merged* into `master`.

At this point, you can discard your branch and go back to master: `git checkout master`.

## 3. Step by step commands for making changes

- Always start from your master branch (`git checkout master`). When you start a new branch (using `git checkout -b branch-name`), you will start this branch **from the previous branch you were on** (read more about this - but most of the time you want to do this when you're on master, not when you're already on a branch).
- Get the latest commits from the "upstream", which is [this repository](https://github.com/4ian/GDevelop).
  - To add the "upstream" as a remote repository, if needed, you can do: `git remote add upstream https://github.com/4ian/GDevelop.git`.
  - Then, get the latest commits (make sure you're on your master): `git pull upstream master` ("pull the latest commits from master branch of the upstream repository"). If there is a merge, it's fine.
- Then from now, always start branch from master:
  - `git checkout master` - to go/be sure you are on master
  - `git checkout -b my-new-feature`
  - Make some changes and commit: `git commit` (and `git add`/`git add -p` to add changes using the command line)
  - Push your changes `git push` to your branch
- When you want to do a new change, unrelated to the branch, go back to master before creating a new change: `git checkout master` and then `git checkout -b my-new-feature-2`
- If you want to at some point update your branches with latest changes in master:
  - Go on master, pull the latest changes (`git pull upstream master`)
  - Go on your branch and either:
    - Easy: merge master in the branch: `git merge master`
    - More risky but allowing to get a *clean history* (no merge commit): `git pull --rebase origin master` (or directly `git pull --rebase upstream master`). This pulls the commits from master, then take the commits you did on your branch, and put them back *on the top* of the commits of master. The only "risk" is that in case of conflicts, you'll have to solve them (`git add` to mark a file as resolved, `git rebase --continue` to finish solving conflicts and apply the next commit until it's finished, `git rebase --abort` if everything is broken and you want to cancel everything).

## 4. I made a PR that got merged, what to do with my branch?

First, congratulations, and thanks for contributing to GDevelop! 🙌
Forget this branch and go back to master (`git checkout master`). Get the latest commits: `git pull upstream master`.

> When your commits are *merged* into GDevelop `master` branch, they most of the time are not directly taken and merged. Instead, they are "squashed" into a single commit, to keep a clean list of commits. This also mean that your exact commits are not preserved (but no worries, you are still considered as the author of the commit) and so you must always go back to master and get the latest commits.

⚠️ In other words, don't **stay on your branch once you're done**. Go back to master and get the latest changes from GDevelop "official" repository.

> If you want to, you can delete the branch you made, as it is not useful: `git branch -D my-branch`. **Make sure that your commits are merged into GDevelop before doing so**. Don't do it before a pull request is merged.

## Afraid of doing something? 🚩Checkpoint! Make a new branch from your existing branch

Last tip: if you're unsure about doing something on your branches, make a copy of your branch.
It's as simple as going on your branch: `git checkout my-feature-branch` and creating a new branch from it, that will be a copy: `git checkout -b my-save` and go back to your branch `git checkout my-feature-branch`. Now you can always checkout `my-save` if you have wrongly rebased/merged something.
