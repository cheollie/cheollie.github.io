// Adapter for the pinned Spline runtime in home.html.
export function configureHomeInteractions(app) {
  const manager = app.eventManager;
  const flowers = manager?.eventContext?.page.getObjectByName('Flower Square');
  const hat = manager?.eventContext?.page.getObjectByName('flower hat');
  const duck = manager?.eventContext?.page.getObjectByName('Group 2');
  const floatEvent = flowers?.data.events.find(event => event.data.type === 'KeyDown' && event.data.key === 'f');
  if (!floatEvent || !duck) return;
  manager.deactivate();
  manager.publish.stopRaycast = true;
  for (const object of [flowers,hat].filter(Boolean)) {
    object.data.events = object.data.events.filter(event => !['flowers-tap','hat-tap'].includes(event.id));
    object.data.events.push({id:object===hat?'hat-tap':'flowers-tap',fi:2,data:{type:'MouseUp',disabled:false,mode:'Object',name:'Tap flowers',actions:[]}});
  }
  for (const event of duck.data.events) {
    if (event.data.type === 'MousePress' && event.data.actions.some(action => action.data.type === 'Audio')) event.data.type = 'MouseUp';
  }
  manager.activate();
  // Share one action runner so F and taps toggle the same animation state.
  const basic = manager.handlers.Basic;
  const floatRunner = basic.eventsPerObjects.KeyDown[flowers.uuid].find(event => event.id === floatEvent.id);
  let floating = false;
  let activeFloat;
  function toggleFloating() {
    floating = !floating;
    if (floating) {
      activeFloat = new floatRunner.constructor(floatEvent.id,structuredClone(floatEvent.data),flowers,manager.eventContext.page,manager.eventContext.sharedAssets,manager);
      activeFloat.dispatch(true);
    }
    else {
      activeFloat.actions.Transition.forEach(action => action.stop());
      activeFloat.disconnect();
      activeFloat = null;
      app.findObjectByName('Flower Square').state = 'Base State';
      manager.requestRender();
    }
  }
  document.addEventListener('keydown',event => {
    if (event.key.toLowerCase() !== 'f') return;
    event.stopImmediatePropagation();
    if (!event.repeat) toggleFloating();
  },true);
  let flowerTap = false;
  for (const object of [flowers,hat].filter(Boolean)) {
    for (const event of basic.eventsPerObjects.MouseUp[object.uuid] || []) {
      if (!['flowers-tap','hat-tap'].includes(event.id)) continue;
      event.dispatch = () => {
        if (flowerTap) return;
        flowerTap = true;
        toggleFloating();
        setTimeout(() => {flowerTap=false;},0);
      };
    }
  }
  // A flower on the duck should float the flowers, rather than also quacking.
  for (const event of basic.eventsPerObjects.MouseUp[duck.uuid] || []) {
    const dispatch = event.dispatch.bind(event);
    event.dispatch = () => queueMicrotask(() => {if (!flowerTap) dispatch();});
  }
}
