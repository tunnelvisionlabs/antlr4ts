# Contributing to the ANTLR 4 TypeScript Target

## Contributor agreement

The ANTLR 4 TypeScript target is a satellite project of ANTLR 4. Contributions to the project in the form of code can
only be considered when sent from users who have signed the
[ANTLR 4 contributor agreement](https://github.com/antlr/antlr4/blob/master/contributors.txt).

## Building from Source

### Prerequisites

Building this repository from source requires several tools:

* Node.js 6.7.x
* Maven 3.3.1+ (3.3.9+ recommended)
* Java Development Kit 1.6+ (1.8+ recommended)

Users working in Visual Studio Code should update their workspace settings to specify the paths for the Java Development
Kit and Apache Maven:

```json
{
  "java.home": "C:\\Program Files\\Java\\jdk1.8.0_192",
  "terminal.integrated.env.windows": {
    "JAVA_HOME": "C:\\Program Files\\Java\\jdk1.8.0_192",
    "PATH": "${env:PATH};C:\\apps\\apache-maven-3.6.0\\bin"
  }
}
```

### Building the code

The code is built through a sequence of several steps which is automated through the following `npm` command.

```
npm install
```

### Running tests

This project includes two separate test suites. The first set of tests is included in the **tests** folder, and is
written in TypeScript using the mocha unit test framework. These tests execute quickly, but only cover a very limited
subset of the TypeScript runtime's functionality.

```
npm test
```

The second set of tests comes from the ANTLR 4 runtime test suite, which provides functional tests of a much larger set
of functionality. The runtime test suite is generated and compiled as part of the `npm install` command, and executed
using the previously-described `npm test` command.

### Performance testing

To run the benchmark suite with profiling enabled, run this command:

```
npm run profile
```

This will create a file of with a file name like `isolate-000001C4B0FF38A0-v8.log`, where the digits will vary with each
run. After collecting this data, you can summarize the results with the following command after modifying it to match
the actual file name produced by the profiler.

```
node --prof-process isolate-000001C4B0FF38A0-v8.log >profile.txt
```

The resulting file, `profile.txt` will contain a summary of the results from running a sampling profiler. 

## Versioning

The TypeScript target for ANTLR 4 is based on the Optimized ANTLR 4 runtime maintained by [Sam Harwell](@sharwell).

### TypeScript runtime versioning

This project uses semantic versioning for releases. The version numbers of the packages produced by this repository are
independent of the version numbers used by the Optimized ANTLR 4 runtime. To the extent possible, all potentially
breaking changes will be itemized in the release notes for each release.

### Changes to the reference repository

After changes are made to the optimized Java runtime, those changes need to be manually incorporated into the TypeScript
runtime. The general process for incorporating these changes is the following:

1. Changes are made to the optimized ANTLR 4 runtime (written in Java)
2. The [reference/antlr4](https://github.com/tunnelvisionlabs/antlr4ts/tree/master/reference) submodule is updated to
   reference the commit containing the changes
3. Using the diff between the old submodule code and the new submodule code, the relevant changes are applied to the
   **antlr4ts** and/or **antlr4ts-cli** projects

> :bulb: By following this policy, users and developers can clearly communicate that the TypeScript target reflects the
> features and/or fixes which were part of the optimized ANTLR 4 runtime as of the specific commit referenced by the
> [reference/antlr4](https://github.com/tunnelvisionlabs/antlr4ts/tree/master/reference) submodule.

### API changes

All pull requests which contain changes to the exposed API must have a corresponding GitHub issue. The issue will be
labeled with the **ts-flavor** label. In addition to minimizing upgrade problems over time, this approach improves our
ability to provide meaningful release notes.

## General practices

### Labels

> TODO

### Code reviews

> TODO

## Other (unorganized notes)

> ## Dev setup - for contributors (to build it from sources)
>
> In addition to the above, building the design-time tool requires:
>
>       - A Java development kit, 1.8x or greater (see above.)  
>       - The [Maven](https://maven.apache.org/download.cgi) project system after downloading, [set it up according to these instructions](https://maven.apache.org/install.html). 
>
> After you clone the project, run `npm install` from the root directory, this will install other runtime- and development-time dependencies.  
>
> The first time you run `npm install`, it will build and install the current version of the **antlr4ts** tool locally.   After that, if you update the tool, you will need to execute the command `npm install tool`.   This includes if you pull any updates that change the tool. 
>
> ## Dev setup with Visual Studio
> Any edition of [Visual Studio 2015](https://www.visualstudio.com/vs/) (or greater) should work, including Communitity Edition.
> You'll want to be sure you have the following VS extensions installed:
> - [Node Tools for Visual Studio 1.2](https://www.visualstudio.com/vs/node-js/) (or greater)
> - [TypeScript for Visual Studio 2015](https://www.microsoft.com/en-us/download/details.aspx?id=48593) 2.03 or greater.
>
> You ***should*** be able to run tests from the Test Explorer, etc... but there seems to be an unresolved problem making this work, for now use the command-line method below to be sure you run them all.
>
> ### Running basic tests should be as simple as...
> ```
> npm test
> ```
> How we integrate with runtime-testsuite is TBD.
>
> ### Generating test code coverage report
> ```
> npm run cover 
> ```
> This executes a code-coverage test run, then generates an interactive HTML report in `coverage/lcov-report/index.html`.
>
> ### Java Reference code
> To view the Java code this project was derived from, use the following commands in the project root directory.   This *isn't* strictly needed for building the project, and the reference implementation is expected to be fairly stable.
>
> ```
> git submodule init
> git submodule update
> ```
> The later (update) command may need to be repeated occasionally after another contributor updates the version of reference code.