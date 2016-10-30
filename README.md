# antlr4ts

TypeScript/JavaScript target for ANTLR 4

[![Build status](https://ci.appveyor.com/api/projects/status/d4gpmnrkfo3tb2t1/branch/master?svg=true)](https://ci.appveyor.com/project/sharwell/antlr4ts/branch/master)


## Dev setup - for develping ANTLR4 code targeting TypeScript/JavaScript/CoffeeScript from 
    - [Nodejs Version 6.x or greater](https://nodejs.org/en/)
    - After installing Nodejs, be sure you have the latest node package manager to the latest with the command `npm i -g npm`
    - You may install the latest stable antlr4ts command globally with the command `npm install -g antlr4ts-cli`.
    - You may install a antlr4ts command into your project with `npm install --save-dev antlr4ts-cli`.   
    - You may install the antlr4ts runtime into your project with `npm install --save antlr4ts`.  

Note: this package has a development time dependency on the [Java Runtime Environment (JRE)](https://java.com/en/download/), or a [Java Development Kit (JDK)](http://www.oracle.com/technetwork/java/javase/downloads/index.html).   These are only required on your development machine, there is no dependency on Java at runtime. 

## Dev setup - for contributors (to build it from sources)

In addition to the above, building the design-time tool requires:

      - A Java development kit, 1.8x or greater (see above.)  
      - The [Maven](https://maven.apache.org/download.cgi) project system after downloading, [set it up according to these instructions](https://maven.apache.org/install.html). 

After you clone the project, run `npm install` from the root directory, this will install other runtime- and development-time dependencies.  

The first time you run `npm install`, it will build and install the current version of the **antlr4ts** tool locally.   After that, if you update the tool, you will need to execute the command `npm install tool`.   This includes if you pull any updates that change the tool. 

## Dev setup with Visual Studio
Any edition of [Visual Studio 2015](https://www.visualstudio.com/vs/) (or greater) should work, including Communitity Edition.
You'll want to be sure you have the following VS extensions installed:
- [Node Tools for Visual Studio 1.2](https://www.visualstudio.com/vs/node-js/) (or greater)
- [TypeScript for Visual Studio 2015](https://www.microsoft.com/en-us/download/details.aspx?id=48593) 2.03 or greater.

You ***should*** be able to run tests from the Test Explorer, etc... but there seems to be an unresolved problem making this work, for now use the command-line method below to be sure you run them all.


### Running basic tests should be as simple as...
```
npm test
```
How we integrate with runtime-testsuite is TBD.

### Generating test code coverage report
```
npm run cover 
```
This executes a code-coverage test run, then generates an interactive HTML report in `coverage/lcov-report/index.html`.

### Java Reference code
To view the Java code this project was derived from, use the following commands in the project root directory.   This *isn't* strictly needed for building the project, and the reference implementation is expected to be fairly stable.

```
git submodule init
git submodule update
```