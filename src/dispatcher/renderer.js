function renderTitle(ad) {
    return `מודעה חדשה: דירת ${ad.rooms} חדרים, בשכונת ${ad.extraData['שכונה']} ברחוב ${ad.extraData['רחוב']}. מחיר: ${ad.price} ש״ח`;
}

function renderImages(images) {

}

function renderBody(ad) {
    return `דירת ${ad.rooms} חדרים מ${ad.merchant ? 'תיווך' : 'פרטי'} בשכונת ${ad.extraData['שכונה']} ברחוב ${ad.extraData['רחוב']} . מחיר: ${ad.price} ש״ח`;

//https://maps.googleapis.com/maps/api/staticmap?keyAIzaSyAwUfJNBM7Uy7doaECdYJ813nlhRs17IT4=&zoom=15&size=400x300&markers=${location.latitude},${location.longitude}`
}

function render(ad) {
    return {
        title: renderTitle(ad),
        body: renderBody(ad)
    }
}

module.exports = render;