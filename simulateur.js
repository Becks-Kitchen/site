/* ==========================================================
   Simulateur de tarif — CALCUL REPRIS TEL QUEL du site La Becquée
   (dépôt La-becquee/labecquee, index.html). Ne pas modifier les
   constantes ni la fonction calcul() : seuls les textes autour
   ont changé (voir CLAUDE.md, section 5).
   ========================================================== */
const TARIF = { horaire:50, minRepas:8, courses:50, creditImpot:0.50, promoPremiereCmd:10 };
const vals = { adultes:2, enfants:0, bebes:0, repas:5 };
const mins = { adultes:1, enfants:0, bebes:0, repas:0 };
const maxs = { adultes:8, enfants:8, bebes:4, repas:14 };

function eur(n) { return Math.max(0,n).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'; }
function show(id,v){ const el=document.getElementById('sim-'+id); if(el) el.style.display=v?'':'none'; }
function simStep(k,d){ vals[k]=Math.min(maxs[k],Math.max(mins[k],vals[k]+d)); document.getElementById('sim-val-'+k).textContent=vals[k]; calcul(); }
function roundUp50(v){return Math.ceil(v*2)/2;}

function calcul(){
  const {adultes,enfants,bebes,repas}=vals;
  const tot=adultes+enfants;

  const bebeWrap=document.getElementById('sim-opt-bebe-wrap');
  if(bebeWrap) bebeWrap.style.display=bebes>0?'':'none';
  const oBBel=document.getElementById('sim-opt-bebe');
  if(bebes===0&&oBBel) oBBel.checked=false;

  const oPD=document.getElementById('sim-opt-petitdej')?.checked;
  const oBB=document.getElementById('sim-opt-bebe')?.checked&&bebes>0;
  const oC=document.getElementById('sim-opt-courses')?.checked;
  const oPC=document.getElementById('sim-toggle-premiere')?.checked;

  const forfaitNettoyage=repas>0?Math.ceil(repas/5)*50:0;
  const moBase=roundUp50((TARIF.minRepas*tot*repas/60)*TARIF.horaire)+forfaitNettoyage;
  const moNette=moBase;

  const pdjMontant=oPD?(tot===1?20:tot===2?25:tot===3?30:50):0;
  const bebeMontant=oBB?50:0;
  const totalSAP=moNette+pdjMontant+bebeMontant;
  const coursesMontant=oC?TARIF.courses:0;
  const brut=totalSAP+coursesMontant;
  const ci=brut*TARIF.creditImpot;
  const net=brut-ci-(oPC?TARIF.promoPremiereCmd:0);

  const pdjPrixLbl=document.getElementById('sim-lbl-pdj-prix');
  if(pdjPrixLbl) pdjPrixLbl.textContent=tot===1?'+20 €':tot===2?'+25 €':tot===3?'+30 €':'+50 €';

  show('line-repas',repas>0&&tot>0);
  const vr2=document.getElementById('sim-val-repas-price'); if(vr2) vr2.textContent=eur(moBase);
  show('line-petitdej',oPD);
  const lpd=document.getElementById('sim-lbl-pdj'); if(lpd) lpd.textContent=`Petit-déj & goûters (${tot} pers.)`;
  const vpd=document.getElementById('sim-val-pdj-price'); if(vpd) vpd.textContent='+'+eur(pdjMontant);
  show('line-bebe',oBB);
  show('line-courses',oC);
  show('line-premiere',oPC);
  document.getElementById('sim-val-brut').textContent=eur(brut);
  document.getElementById('sim-val-ci').textContent='−'+eur(ci);
  document.getElementById('sim-val-net').textContent=eur(net);
  const portions=tot*repas;
  const pp=document.getElementById('sim-parportion'); if(pp) pp.style.display=(portions>0&&net>0)?'':'none';
  const vppp=document.getElementById('sim-val-parportion'); if(vppp&&portions>0) vppp.textContent=eur(net/portions);
  const note=document.getElementById('sim-note'); if(note) note.textContent='';
}

/* ── Ouvrir / fermer le simulateur (textes Beck's Kitchen) ── */
const ICONE_ESTIMER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>';
const ICONE_MASQUER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';

function toggleSim(btn, forcerOuverture) {
  const w = document.getElementById('sim-wrap');
  if (forcerOuverture) w.classList.add('open'); else w.classList.toggle('open');
  const ouvert = w.classList.contains('open');
  btn.innerHTML = ouvert ? ICONE_MASQUER + ' Masquer' : ICONE_ESTIMER + ' Estimer mon tarif';
  btn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  if (ouvert) calcul();
}

/* Boutons « Estimer mon tarif » du héro et du dernier appel : descendent au simulateur et l'ouvrent */
document.querySelectorAll('[data-ouvrir-simulateur]').forEach(function (lien) {
  lien.addEventListener('click', function () {
    toggleSim(document.getElementById('btn-estimer'), true);
  });
});

/* ── Formulaire de contact : envoi par Web3Forms ──
   La clé d'accès Web3Forms est publique par conception (elle sert seulement
   à désigner la boîte qui reçoit les messages) : elle peut rester ici. */
const WEB3FORMS_CLE = 'b1ce1db2-5220-44d4-b993-74b277dc5334';
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

async function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const erreur = document.getElementById('form-erreur');
  const bouton = document.getElementById('form-envoyer');
  if (erreur) erreur.hidden = true;

  // Champs obligatoires et e-mail valide
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(f => {
    f.classList.remove('erreur');
    if (!f.value.trim() || (f.type === 'email' && !f.checkValidity())) { f.classList.add('erreur'); valid = false; }
  });
  if (!valid) { form.querySelector('.erreur').focus(); return; }

  const d = Object.fromEntries(new FormData(form));
  const val = v => (v && String(v).trim()) || '—';
  const sujet = `Nouvelle demande Beck's Kitchen — ${d.prenom.trim()} ${d.nom.trim()}` + (d.commune && d.commune.trim() ? ` — ${d.commune.trim()}` : '');

  const donnees = {
    access_key: WEB3FORMS_CLE,
    subject: sujet,
    from_name: "Site Beck's Kitchen",
    replyto: d.email.trim(),
    botcheck: form.querySelector('[name="botcheck"]').checked,
    'Prénom': val(d.prenom),
    'Nom': val(d.nom),
    'E-mail': val(d.email),
    'Commune': val(d.commune),
    'Taille du foyer': val(d.foyer),
    'Contraintes alimentaires': val(d.contraintes),
    'Comment nous avez-vous connus ?': val(d.source),
    "Format d'échange préféré": val(d.format),
    'Message': val(d.message)
  };

  const texteBouton = bouton ? bouton.innerHTML : '';
  if (bouton) { bouton.disabled = true; bouton.textContent = 'Envoi en cours…'; }
  let reussi = false;
  try {
    const rep = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(donnees)
    });
    const res = await rep.json().catch(() => ({}));
    reussi = rep.ok && res.success === true;
  } catch (err) {
    reussi = false;
  }
  if (bouton) { bouton.disabled = false; bouton.innerHTML = texteBouton; }

  if (reussi) {
    // « Message envoyé » seulement quand Web3Forms confirme l'envoi
    form.reset();
    const fc = document.getElementById('form-container'); if (fc) fc.style.display = 'none';
    const fs = document.getElementById('form-success'); if (fs) { fs.classList.add('show'); fs.scrollIntoView({ block: 'center' }); }
  } else if (erreur) {
    // Le formulaire garde ce que la personne a écrit
    erreur.hidden = false;
    erreur.scrollIntoView({ block: 'center' });
  }
}

/* Bouton « Copier l'adresse » du message d'erreur */
(function () {
  const b = document.getElementById('copier-adresse');
  if (!b) return;
  b.addEventListener('click', function () {
    const adresse = 'contact@becks-kitchen.fr';
    const fini = function () { b.textContent = 'Adresse copiée'; setTimeout(function () { b.textContent = "Copier l'adresse"; }, 2500); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(adresse).then(fini, function () { window.prompt("Copiez l'adresse :", adresse); });
    } else {
      window.prompt("Copiez l'adresse :", adresse);
    }
  });
})();
