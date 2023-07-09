//object permetant de stocker mon utilisateur
var utilisateur = new Object();
utilisateur.mail = "";
utilisateur.identifiant = "";
utilisateur.contacts = null;
utilisateur.chats = [];
utilisateur.identite = "";
//les diiférentes pages à afficher
var connexion = document.getElementById("div_conx");
const newLocal = "";
var ajout = document.getElementById("div_ajout");
var liste_contacts = document.getElementById("div_cont");
var page_act;
//variable booleen
var c_g = false;



//première page ouverte
function pg_db()
{
    selection(connexion,true);
    selection(liste_contacts,false);
    selection(ajout,false);
    page_act = connexion;
}
//selection de la page à afficher
function selection(x,value)
{
    if(value)
    {
        x.style.display = "flex";   
    }else
    {
        x.style.display = "none"
    }
}
//fonction pour afficher la page
function afficher(x)
{
    if(x != page_act)
    {
        if(c_g)
        {
            selection(page_act,false);
            selection(x,true);
            page_act = x;
        }
        
    }
}
//fonction pour accéder à son compte
function charger()
{
    var input = document.getElementById("identifiant");
    if(input.value != "")
    {
        utilisateur.identifiant = input.value;
    }else
    {
        utilisateur.identifiant = input.getAttribute("placeholder");
    }
    fetch("https://trankillprojets.fr/wal/wal.php?information&identifiant=" + utilisateur.identifiant)
    .then(reponse => reponse.json())
    .then(json => {
        if(json.etat.reponse==1)
        {
            input.value = "";
            utilisateur.identite = json.identite;
            utilisateur.mail = json.mail;
            utilisateur.contacts = null;
            init_cont();
            afficher(liste_contacts);
        }else
        {
            console.log("error446");
        }
    }).catch(erreur => console.log(erreur));
    c_g = true;
}
//initialiser les contacts 
function init_cont()
{
    fetch("https://trankillprojets.fr/wal/wal.php?relations&identifiant=" + utilisateur.identifiant)
    .then(reponse => reponse.json())
    .then(json => {
        if(utilisateur.contacts == null)
        {
            utilisateur.contacts = json;
            n_cont(utilisateur.contacts.relations);
        }else if(json.relations.length != utilisateur.contacts.relations.length)
        {
            utilisateur.contacts = json;
            n_cont(utilisateur.contacts.relations);
        }
    }).catch(erreur => console.log(erreur));
    setTimeout(init_cont,1000);
}

function n_cont(relations)
{
    console.log(relations);
    //supprimer les contacts
    document.querySelectorAll("#but_cont").forEach(contact => contact.remove());
    document.querySelectorAll("#boutton_supprimer").forEach(contact => contact.remove());
    //tableau pour mettre les messages envoyer par l'utilisateur
    utilisateur.chats = [];
    var but_cont = document.createElement("div");
    but_cont.setAttribute("id","but_cont");
    var boutton_supprimer = document.createElement("div");
    boutton_supprimer.setAttribute("id","boutton_supprimer");
    for(i of relations)
    {
        var z_txt = document.querySelector("div" + i.relation);
        var it = utilisateur.chats.length;
        if(!z_txt)
        {
            z_txt = zone_text(i.identite,i.relation,it);
            document.body.appendChild(z_txt);
            selection(z_txt,false);
        }
        utilisateur.chats.push(z_txt);
        var contact = document.createElement("div");
        contact.appendChild(document.createTextNode(i.identite));
        contact.setAttribute("onclick","{afficher(" + "utilisateur.chats[" + it + "]" +");" + "clearInterval(time_charg);" + "aj_sms(" + i.relation + "," + it + ")}");  
        contact.setAttribute("id","contact");
        contact.className = "contact";
        but_cont.appendChild(contact);
        var sup = document.createElement("button");
        sup.textContent = "Retirer";
        sup.className = "supp"
        sup.setAttribute("onclick","supprimer_cont(" + i.relation + ")");
        boutton_supprimer.appendChild(sup);
       
    }
    
    liste_contacts.appendChild(boutton_supprimer);
    liste_contacts.appendChild(but_cont);
}
//fontion permettant la supprésion des contacts
function supprimer_cont(rid)
{
    console.log(rid);
    fetch("https://trankillprojets.fr/wal/wal.php?delier&identifiant=" + utilisateur.identifiant + "&relation=" + rid)
    .then(reponse => reponse.json())
    .then(json => {
        if(json.etat.reponse==1)
        {
            init_cont();
        }else
        {
            console.log("error446");
        }
    }).catch(erreur => console.log(erreur));
}
//ajout d'un contact
function f_ajouter()
{
    var input = document.getElementById("inp_mail");
    fetch("https://trankillprojets.fr/wal/wal.php?lier&identifiant=" + utilisateur.identifiant + "&mail=" + input.value)
    .then(reponse => reponse.json())
    .then(json => {
        if(json.etat.reponse==1)
        {
            input.value = "";
            init_cont();
            afficher(liste_contacts);
        }else
        {
            console.log("error446");
        }
    }).catch(erreur => console.log(erreur));
}

//création de zone de texte
function zone_text(identite,rid,it)
{
    var ligne_decris = document.createElement("div");
    ligne_decris.setAttribute("id",rid);
    var zonedetexte = document.createElement("input");
    zonedetexte.setAttribute("id","chatInput " + rid);
    ligne_decris.appendChild(zonedetexte);
    var button_envoie = document.createElement("button");
    button_envoie.textContent = "envoyer";
    button_envoie.setAttribute("id","button_envoie");
    button_envoie.setAttribute("onclick","envoi_message(" + rid + ","+ it + ")");
    ligne_decris.appendChild(button_envoie);
    ligne_decris.className = "ligne_dec";
    var z_txt = document.createElement("div");
    var zone_decris = document.createElement("div");
    zone_decris.className = "zone_decris"; 
    var label = document.createElement("div");
    label.setAttribute("id","nom_utili");
    label.appendChild(document.createTextNode(identite));
    z_txt.appendChild(ligne_decris);
    z_txt.appendChild(zone_decris);
    z_txt.appendChild(label);
    z_txt.className = "z_txt";
    return z_txt;
}
var time_charg;
//rajout des message
function aj_sms(rid,it)
{
    var z_txt_suiv = utilisateur.chats[it].children;
    var z_txt = z_txt_suiv[1];
    fetch("https://trankillprojets.fr/wal/wal.php?lire&identifiant=" + utilisateur.identifiant + "&relation=" + rid)
        .then(reponse => reponse.json())
        .then(json => {
            if(json.etat.reponse==1)
            {
                for(i of json.messages)
                {
                    var message = document.createElement("div");
                    message.appendChild(document.createTextNode(i.message));
                    message.setAttribute("id","message");
                    message.className = "message";
                    if(utilisateur.identite == i.identite)
                    {
                        message.classList.add("utilisateur");
                    }else
                    {
                        message.classList.add("uti");
                    }
                    z_txt.appendChild(message);
                    console.log(i);
                }
            }else
            {
                console.log("error446");
            }
        }).catch(erreur => console.log(erreur));
    time_charg = setTimeout("aj_sms("+rid + "," + it +")",1000);
}

function envoi_message(rid,it)
{
    msg = document.getElementById("chatInput " + rid)
    if(msg.value != "")
    {
        fetch("https://trankillprojets.fr/wal/wal.php?ecrire&identifiant=" + utilisateur.identifiant + "&relation=" + rid + "&message=" + msg.value)
        .then(reponse => reponse.json())
        .then(json => {
            if(json.etat.reponse==1)
            {
               aj_sms(rid,it);
                msg.value = "";
            }else
            {
                console.log("error446");
            }
        }).catch(erreur => console.log(erreur));
    }
}