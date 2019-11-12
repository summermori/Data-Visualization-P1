# P1 - Scaffold

Here we provide a place for you to do your work in project 1. We strongly encourage you to do your work here.

## Setup

As always, have npm/node/yarn installed.

```sh
npm install
# then
npm run start
```

Just as in the previous assignments we will be using the gulp build pipeline. This means that you
will still need to be explicit about your imports, eg

```js
import {functionFromModule} from 'target-module';
```

In this scaffold we have not installed any d3 packages. You are free to choose which aspects of the
d3 library you wish to use for this project.

## Your work

There will most likely be three components to your work for this project

- Data preparation: This means transforming your raw data into a manner that fits in the browser
  (the browser gets real slow at around 20mb), and is easy to render with d3. In order to keep
  everybody honest, we'd really appreciate it if you could include any and all data processing
  scripts you write in the scripts folder of this project. Please do not commit your data if it
  larger than 8 megabytes. Just include a link in your write up. On the other hand, if you have
  a small dataset, you should include commit it into the repository directly.

- Data presentation: Your code for actually rendering the data to the browser. This code should live
  in src/index.js and src/utils.js files. Feel free to make additional files if it makes sense.

- PDF preparation: Once you have your visualization ready, you'll probably want to make it look
  super cool. This can be done either in d3 or in illustrator, we're indifferent.


## Tips
- Start early
- Ask for help if you need it
- Just like in hw4, if you want to use additional resources place them in the app/static
  folder. (this can be especially helpful if you have a complex legend that you don't want to render
  in d3. A effective technique would be to create your legend it a more user friendly vector drawing
  application and then import it here. See hw4 for examples on how to do that.)
- remember CSS is not applied on pdfs (that's just the nature of the spec) so make sure to do all your styling in the svg itself

## Preparing your graphic to print

There are lots of ways to prepare your pdf for us to print.

- You can print directly to pdf from chrome!

- Another way is to use crowbar. As discussed previously crowbar ( https://nytimes.github.io/svg-crowbar/ ) is bookmarklet which allows for the direct download of svg. Your can then transform your svg into a pdf through various converters or design tools

It can be helpful to do proof-of-concpet prints on an inexpensive home printer. This will give you a sense on how the components will be laid out. You are welcome to touch up your image in illustrator or sketch or any other svg manipulation tool that you like.


## How your work will be printed
In this assignment we require that you turn in a PDF of the exact dimensions that we have specified.
If you turn in an PDF not in these dimensions there will be serious point penalties.



## Some basic considerations for knowing whether you're done:

- Does your graphic have the correct dimensions?
- Does your graphic have a title?
- Does your graphic have the correct dimensions?
- Does your graphic have all of your group member's names on it?
- Does your graphic have the correct dimensions?
- Does your graphic have a legend and a description?
- Refresh your page a few times, does your graphic always look the way it's supposed to?
- Does your javascript code pass lint?
- Does your pdf look like you want?
