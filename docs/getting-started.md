# Getting Started with Skpm

> Skpm is a companion tool that aims to totally replace the terminal, so that newcomers to the field aren't burdened with a whole other skillset they need to learn before they can get started building cool things.
>
> It's currently in pre-release Alpha, which means that we're still a long way from fully realizing that dream. You may run into bugs, and it may not be compatible with your existing projects or operating system.
>
> Apologies in advance for any trouble you run into! Contributions welcome.

## Installation

Installation instructions in the [README](https://github.com/skpm/skpm-gui/blob/master/README.md#installation).

## Adding your first plugin

To create your first plugin, click "Create a new Sketch plugin" at the bottom of the main screen.

The wizard will guide you through selecting a name, icon, and plugin template.

If you already have a plugin that you'd like to use with Skpm, you can opt to import an existing plugin instead. _Please be advised that this feature hasn't been rigorously tested!_ It will only work with projects created with the skpm cli, and in the worst case it could potentially mess up your plugin's `manifest.json` file. To play it safe, make sure that your project is managed with source-control, so that you can easily reset it if anything goes wrong.

For more information on the plugin-creation process, please see our [Adding a Plugin](https://github.com/skpm/skpm-gui/blob/master/docs/adding-a-project.md) doc.

## Managing your plugin

After creating or importing a plugin, you'll be presented with the plugin screen. Everything you need to manage your plugin exists on this page!

It's split up into 4 modules: **Development Mode**, **Commands**, **Tasks**, and **Dependencies**.

### Development Mode

In the past, plugin development could be as simple as having a single an "command.js" file in a sketch plugin with everything inside.

As the web moved from simple command to complex plugins, this stopped being a viable way to work. Today's plugins are rich and dynamic, and require a more complicated setup.

The solution is to use technologies proven for the web to enable using npm packages, code linters and more.

The Development Mode do a bunch of work behind the scenes - for example, it watches the files in the project, and when the files change, the plugin auto-refreshes!

Also, in the past, you had to be very mindful about the fact that your code would not run in a browser so common methods like `fecth` or `setTimeout` were not available. It is running on the WebKit Javascript engine, with its own quirks and supported/unsupported language features. The Development Mode will compile the code you write into a form that Sketch can understand, so it's far less of an issue.

A few years ago, creating and managing a local development environment was a big hassle. Nowadays, it's even easier than the oldschool "single command.js file" approach, and comes with a bunch of additional benefits.

To turn the Development Mode on, click the toggle in the top-right of the module:

![Development mode module](https://github.com/skpm/skpm-gui/raw/master/docs/images/dev-server-toggle.png)

You'll see two things happen:

- The "Idle" status indicator on the left switches to "running", and the light turns green. The status indicator is a great way to quickly check what's going on: because it compiles your code, it knows when it hits an error, and can alert you to the fact that things aren't working properly.

- The blue box on the right starts filling with output. This can often be overwhelming, as it produces a lot of information that often isn't super relevant, but it also includes helpful info about errors and warnings.

> The output you see is meant to be displayed in a terminal, and so sometimes the info isn't relevant for working with Skpm.
>
> In future versions of Skpm, we hope to show curated, beginner-friendly output in this space instead.

At first, **this is the only module you need to worry about**. After you've started the Development Mode, feel free to tab over to your code editor and start building your plugin! You can learn more about the other modules later.

### Commands

### Tasks

As you continue to work on your project, you'll notice that there are some chores that need doing. For example, once your plugin is ready to be used by all the Sketch users, you need a way to publish it!

Each task gets its own row, which tells you:

- The name of the task (eg. `publish`)
- A quick description of the task
- The task status
- A button to view more information about the task
- A toggle to start (or interrupt) the task

Run a task by clicking the toggle on the right side of each task:

![Development server module](https://github.com/skpm/skpm-gui/raw/master/docs/images/task-row-toggle.png)

You can also run tasks from within the "View Details" panel:

![Development server module](https://github.com/skpm/skpm-gui/raw/master/docs/images/task-details-toggle.png)

When you toggle a task on, the status will switch to "pending". If you're curious to see what it's doing, you can click "View Details" to get a terminal output screen, much like the one the Development Mode module has.

When the task completes, the status will switch to "success" or "error", depending on whether the task ran into any problems. The "View Details" button is a great way to learn more about why a task might have failed.

### Dependencies

As plugin developers, we often find that our projects have the same problems that need to be solved. Sketch doesn't come with a built-in solution for manipulating colors, for example, and it would be extremely tedious if we all had to build our own color manipulation solutions, for every plugin we start!

Happily, we can save a ton of time and energy by using solutions that other developers have built.

In the javascript community, these solutions are called _packages_. They're distributed through the Node Package Manager (NPM). Your project can _depend_ on packages, which will make those solutions available to you in your code.

This third module lets you add, update, or remove packages that other folks have written.

> You'll see that there are already a few installed. These are crucial dependencies for building your plugin, and it's prudent not to try and remove them.

Let's say you've realized that your plugin needs to change some colors. It would take a fair bit of time to build one of these algorithms yourself, so it might make sense to see if there's already one available in the community!

Click the "Add New Dependency" button to search for a new dependency:

![Development server module](https://github.com/skpm/skpm-gui/raw/master/docs/images/add-dep-button.png)

If you search for "color", you'll see a few options come up:

![Development server module](https://github.com/skpm/skpm-gui/raw/master/docs/images/search-deps.png)

You can click the names of these packages to learn more about them, and decide if they solve the problem you need. You can also use the data included in the search results to inform your decision:

- How many downloads does it have? Popular packages tend to be safer bets, since there are more people using them, and likely more people helping to build them
- How long ago was it last updated? Unmaintained packages that haven't been updated in months/years aren't as safe as recently-updated ones
- What software license does it provide? The software license details how it can be used. MIT license is the gold standard, and it might be worth ignoring solutions that don't use it.

If you click the "Add to Plugin" button beside each search result, that package will be added as a dependency to your project. You'll be able to use it in your project the same way that you currently use the Sketch API:

```js
import sketch from 'sketch';
import Color from 'color';
```

In the main module, you can browse through the list of installed dependencies. If the dependency is out-of-date, you can click the "Update" button to update it to the newest version.

You can delete dependencies in the Danger Zone (🔥).

You can update dependencies to their latest version in 1 click by clicking "Update", next to the version number.

> It is not currently possible to downgrade a dependency, or to select a specific dependency. This'll be added in the future. For now, you'll need to use a terminal to do this. Learn more at the [npm docs](https://docs.npmjs.com/cli/install)

### Editing your plugin

Skpm creates a folder inside of your home directory called `sketch-plugins`. When you create a new plugin with Skpm, it lives in a folder inside of `sketch-plugins`. Find your project there, and edit away!

## Modifying and Deleting Plugins

Projects can be removed from Skpm by going to Current Plugin -> Delete Plugin, and confirming the prompt.
