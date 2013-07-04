FrameBroadcast
__________

FrameBroadcast is a trivially simple JavaScript module that solves the problem
of communicating between all frames in a page without requiring you to know the
locations (URLs) of each.  It's basically for edge cases like when you're
making significant modifications to  a page you don't.  I can't imagine a good
use case for this if you have control over the page.

FrameBroadcast, uses the
[PostMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
"PostMessage") [API](http://davidwalsh.name/window-postmessage "API") to
broadcast messages to all registered iframes to allow such asynchronous events
to be sent and received.

For instance, let's say you have two (or more) iframes (to get around the
same-origin problem) you added to a page via GreaseMonkey and you want an event
on one to trigger a callback on another.  Here, you would instantiate
FrameBroadcast on the root frame and all child frames on the document tree to
your frame, set a FrameBroadcast handler in your iframe and then be able to
send and receive messages.

Example:

In the root document:

```javascript
var frameTransceiver = new FrameTransceiver('root', function(frameMessage)
{ // the message handler -- gets called when we receive a message
  var message = frameMessage.payload;
  // messages (e.g., JSON) from some dialog box
  if (message.name === 'submission')
  { // successfully submitted; note: submission failures are handled by having the user acknowledge/retry or cancel
    caseRatingBox.close(); // close the box
  }
  else if (message.name === 'request')
  { // a request has been made in the child iframe; display the dialog to gather data
    dialogBox.show(message.data);
  }
  else console.log('unrecognized message ' + JSON.stringify(message));
});
```

In one child we reload and/or redraw a graph on data submission:

```javascript
var frameTransceiver = new FrameTransceiver('child_1', function(frameMessage)
{
  var message = frameMessage.payload;
  if (message.name === 'submission' &&     // data was submitted
      message.data.comm_id == our_comm_id) // and the comm id matches our own
  {
    radarChart.requestDataAndRedraw(message.data);   // redraw using the newly submitted data
  }
});
```

In another child we handle data form submission

```javascript
$(document).ready(function()
{
  window.frameTransceiver = new FrameTransceiver('box', function(frameMessage)
  {
    var message = frameMessage.payload;
    // we handle sending click ignore all messages
  });
});

// somewhere else in the page
function handleSubmit()
{
  var formData = getFormData();
  // send data to server
  sendDataToServer(formData);
  // tell the graph to update
  var message = new FrameMessage(new YumaCaseRatingEvent('submission', formData));
  that.frameTransceiver.broadcast(message);
}

// still somewhere else
      <button id="rating_submit"
              name="rating_submit"
              type="submit"
              value="submit"
              onclick='handleSubmit();'>Submit</button>
```

As I said, it is probably of use to all of three people on the planet: those
who need to embed frames that need to talk to each other in a page they don't
control and can trust that no other windows send messages to them.

Since PostMessage API messages can only be passed between frames, the library
operates by forming a tree of frames, passing "broadcast" messages up to the
root and then down to all frames.

