# antlr4ts
TypeScript/JavaScript target for ANTLR 4

## Dev setup with Visual Studio

Start by installing [TypeScript for Visual Studio 2015](https://www.microsoft.com/en-us/download/details.aspx?id=48593) to get the latest integration with TypeScript 2.0 features.

You should be able to run tests from the Test Explorer, Test Menu, or by clicking on the margin icon next to specific tests or suites.   To if you create new test files, you will need to set the TestFramework property on the file to "Mocha".

## Dev setup with NPM
Of course, you'll need to install Node.js for your platform.   https://nodejs.org/en/
After cloning the repository, you can install dependencies by changing into the cloned directory and typing:

```
npm Install
```
you will need to do this again as we take on new dependencies or updates. 

### Running basic tests should be as simple as...
```
npm Test
```
How we integrate with runtime-testsuite is TBD.

### Generating test code coverage report
```
npm run cover 
```
This executes a code-coverage test run, then generates an interactive HTML report in `coverage/lcov-report/index.html` 
