(function(){
  const final = new Date('2025-09-27T00:00:00+09:00');
  const today = new Date();
  const diff = Math.ceil((final - today) / (1000*60*60*24));
  const el = document.getElementById('days-left');
  if(el) el.textContent = diff > 0 ? diff : 0;
})();
