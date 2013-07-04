var FrameMessage,
    FrameTransceiver;

(function() {

FrameMessage = function(payload)
{
  this.source = null;
  this.upbound = true;
  this.payload = payload;
};

FrameTransceiver = function(id, userHandler)
{
  var that = this;
  this.id = id;
  this.amRoot = function() { return parent == self; };
  this.userHandler = userHandler;
  this.rootHandler = function(message)
  {
    // we're at top-level ... turn off the sentinel
    message.upbound = false;
    // now call the window handler for this frame
    if (message.source != that.id)
      this.userHandler(message);
    // and then post the message to each subframe
    for (var i=0; i<self.frames.length; i++)
      self.frames[i].postMessage(message, '*');
  };
  this.childHandler = function(message)
  {
    // if the message is upbound, pass it up
    if (message.upbound)
      parent.postMessage(message, '*');
    else // otherwise, it's downbound
    {
      // call our handler, unless we're the message source
      if (message.source != that.id)
        that.userHandler(message);
      // then send the message downward
      for (var i=0; i<frames.length; i++)
        frames[i].postMessage(message, '*');
    }
  };
  this.broadcast = function(message)
  {
    message.upbound = true; // set upbound
    message.source = that.id; // set the source as us
    parent.postMessage(message, '*');
  };
  window.addEventListener('message', function(event)
  {
    var message = event.data;
    // if we're the root and the message is upbound
    if (that.amRoot() && message.upbound)
      that.rootHandler(message);
    else if (that.amRoot())
      console.log('FrameBroadcast: received a downbound message as root; weird ... discarding');
    else that.childHandler(message);
  }, false);
};

})();

