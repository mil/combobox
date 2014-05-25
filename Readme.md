# combobox
A lightweight selectbox replacement. Built entirely with components, no jQuery or other frameworks. Comes with search functionality, keyboard navigation and other cool stuff.

![combobox component](https://i.cloudup.com/DNoZZTN3-x.png)

## Installation
    $ component install eivindfjeldstad/combobox

## Example
```js
var combo = require('combobox');

combo({ search: true })
  .add(1, 'Option 1')
  .add(2, 'Option 2')
  .add(3, 'Option 3')
  .appendTo(document.body);
```

## License
The MIT License (MIT)

Copyright (c) 2014 eivindfjeldstad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
