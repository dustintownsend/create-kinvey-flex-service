import * as sdk from 'kinvey-flex-sdk';

sdk.service((err, flex) => {
  const {
    functions
  } = flex;

  functions.register('firstFunction', function (context, complete, /* modules */) {
    return complete('success').ok().next();
  });
});
