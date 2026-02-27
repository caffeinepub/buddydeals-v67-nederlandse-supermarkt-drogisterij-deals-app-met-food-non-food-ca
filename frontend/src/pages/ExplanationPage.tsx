import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Store, MapPin, Users, Bell, ShoppingCart, Star, QrCode, RefreshCw, FolderOpen, Navigation, Award, Wallet, ArrowRight } from 'lucide-react';

export default function ExplanationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 shadow-soft">
          <Store className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Hoe werkt BuddyDeals?
        </h1>
        <p className="text-lg text-muted-foreground">
          Ontdek hoe je samen kunt besparen met 1+1 gratis aanbiedingen
        </p>
        <p className="text-sm text-primary font-semibold mt-2">
          Versie 61 - Nu met verbeterde winkelwagen "Go" knop functionaliteit
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="workflow" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Verplichte Supermarkt Selectie Workflow</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Stap 1: GPS-gebaseerde Supermarkt Keuze
                </CardTitle>
                <CardDescription>
                  De app detecteert automatisch uw locatie en toont de dichtstbijzijnde supermarkt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Automatische GPS-detectie</p>
                    <p className="text-sm text-muted-foreground">
                      Bij het openen van de supermarkt selectie wordt automatisch uw locatie opgevraagd via de browser geolocation API
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Afstandsberekening</p>
                    <p className="text-sm text-muted-foreground">
                      De app berekent de afstand tussen uw locatie en alle acht ondersteunde supermarkten (Albert Heijn, Jumbo, Lidl, Dekamarkt, Aldi, Spar, Dirk, Deen)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Visuele highlighting</p>
                    <p className="text-sm text-muted-foreground">
                      De dichtstbijzijnde supermarkt wordt prominent gemarkeerd met een "Dichtsbij" badge en speciale styling
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Handmatige keuze mogelijk</p>
                    <p className="text-sm text-muted-foreground">
                      U kunt altijd handmatig een andere supermarkt kiezen, ongeacht de GPS-suggestie
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Stap 2: GPS Filiaal Suggestie
                </CardTitle>
                <CardDescription>
                  Automatische detectie van het dichtstbijzijnde filiaal van uw gekozen supermarkt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Na het kiezen van een supermarkt berekent de app automatisch het dichtstbijzijnde filiaal op basis van uw GPS-coördinaten. U kunt het voorgestelde filiaal accepteren of handmatig een ander filiaal kiezen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Stap 3: Automatische Aanbiedingen Weergave
                </CardTitle>
                <CardDescription>
                  Direct toegang tot gefilterde 1+1 gratis aanbiedingen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Na bevestiging van het filiaal worden automatisch de "1+1 gratis" aanbiedingen van uw gekozen supermarkt geladen. De homepage toont alleen aanbiedingen van uw geselecteerde supermarkt met real-time data van officiële folder endpoints.
                </p>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="registration" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Registratie en Profiel</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Na het voltooien van de supermarkt selectie workflow wordt u gevraagd om een profiel aan te maken. Vul uw naam, e-mailadres en woonplaats in. U kunt ook een profielfoto uploaden (JPEG/PNG, max 5MB) en uw favoriete productcategorieën selecteren.
            </p>
            <p className="text-sm text-muted-foreground">
              De app detecteert automatisch uw locatie via GPS en stelt een afspraaklocatie (meetingSupermarket) voor. U kunt kiezen tussen de GPS-gebaseerde suggestie of handmatig een supermarkt selecteren uit de lijst. Deze afspraaklocatie wordt gebruikt voor matches met andere gebruikers.
            </p>
            <p className="text-sm text-muted-foreground">
              Uw profiel kan later worden aangepast via "Mijn profiel" in het hoofdmenu. U kunt uw voorkeursupermarkt wijzigen, wat de supermarkt selectie workflow opnieuw activeert.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="offers" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Aanbiedingen Bekijken</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              De homepage toont gefilterde "1+1 gratis" aanbiedingen van uw gekozen supermarkt in een moderne bol.com-stijl layout. Alleen aanbiedingen met "1+1 gratis"-actie worden getoond, rechtstreeks gesynchroniseerd van officiële folder endpoints.
            </p>
            <p className="text-sm text-muted-foreground">
              Elke aanbieding toont het supermarktlogo, productfoto (met automatische fallback naar placeholder), originele prijs, actieprijs en looptijd. Bronlabels en timestamps tonen de herkomst en actualiteit van de data.
            </p>
            <p className="text-sm text-muted-foreground">
              U kunt zoeken naar specifieke producten en filteren op productcategorie, merk en prijsbereik. De "Folder van de week" pagina toont alle actuele aanbiedingen van alle acht supermarkten in een magazine-achtige layout.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cart-go" className="border rounded-2xl px-6 shadow-soft bg-gradient-to-br from-primary/5 to-secondary/5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold text-lg">Winkelwagen "Go" Knop</span>
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Nieuw in v61
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  Directe Navigatie naar Match Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>De winkelwagen pagina heeft nu een "Go" knop die u direct naar de Match Portal brengt:</strong>
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Vervangen "Afrekenen" knop:</strong> De voormalige "Afrekenen" knop is volledig vervangen door de "Go" knop met groen-blauw BuddyDeals styling
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Directe navigatie:</strong> Bij klikken op "Go" wordt u direct doorgestuurd naar de Match Portal pagina met alle winkelwagen producten
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Geen checkout prompts:</strong> Alle directe checkout en betaal acties zijn verwijderd van de winkelwagen interface
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Match Portal workflow:</strong> De "Go" knop initieert alleen het matching proces, betalingen worden pas geactiveerd na succesvolle match
                    </div>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Deze workflow zorgt ervoor dat u eerst een match vindt met andere gebruikers voordat u verder gaat met de betaling. Dit maakt het gemakkelijker om samen te besparen met 1+1 gratis aanbiedingen.
                </p>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="matching" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Match Portal en 70% Algoritme</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              De Match Portal is het centrale punt waar u wordt gekoppeld aan andere gebruikers. Na het klikken op de "Go" knop (in de winkelwagen of bij product selectie) wordt u doorgestuurd naar de Match Portal met al uw geselecteerde producten.
            </p>
            <p className="text-sm text-muted-foreground">
              De app gebruikt een 70% match algoritme: alleen matches met minimaal 70% overeenkomende producten worden als geldig beschouwd. De Match Portal toont real-time uw match percentage en status ("Wachten op match..." of "Match gevonden!").
            </p>
            <p className="text-sm text-muted-foreground">
              Wanneer een 70%+ match wordt gevonden, ontvangen beide gebruikers automatisch een notificatie met informatie over het match percentage, de andere gebruiker, hun profielfoto en de afspraaklocatie ("Afspraak bij: [supermarktnaam]").
            </p>
            <p className="text-sm text-muted-foreground">
              In de Match Portal kunt u producten toevoegen of verwijderen, waarna het match percentage real-time wordt herberekend. Na een succesvolle match kunt u direct overgaan naar het gedeelde aankoop proces.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notifications" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Notificaties</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Het notificatiepaneel toont alle meldingen over productmatches. Notificaties bevatten de profielfoto van de gematchte gebruiker, het match percentage en de afspraaklocatie. U kunt vanuit notificaties direct contact leggen voor gedeelde aankopen.
            </p>
            <p className="text-sm text-muted-foreground">
              Een visuele indicator in de header toont het aantal ongelezen notificaties. Notificaties worden automatisch als gelezen gemarkeerd wanneer u erop klikt.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payments" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Gedeelde Betalingen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Op productdetailpagina's kunt u een gedeelde betaling initiëren met de knop "Samen betalen met iDeal". Het bedrag wordt automatisch in tweeën gedeeld en beide gebruikers worden doorgestuurd naar hun eigen iDeal-betaalscherm.
            </p>
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Betaalmethode Selectie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Tijdens het checkout proces kunt u kiezen tussen twee betaalmethoden:</strong>
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Contant betalen:</strong> Betaal met contant geld bij de supermarkt
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Met pin betalen:</strong> Betaal met pinpas bij de supermarkt
                    </div>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Deze keuze wordt getoond aan beide deelnemers, zodat jullie weten hoe de betaling zal plaatsvinden bij de supermarkt. Dit maakt het gemakkelijker om de aankoop te coördineren.
                </p>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
              De aankoop wordt bevestigd en opgeslagen zodra beide betalingen succesvol zijn. Gedeelde aankopen tonen de afspraaklocatie ("Afspraak bij: [supermarktnaam]") en de gekozen betaalmethode ("Betaalmethode: Contant/Pin"). De tab "Gedeelde aankopen" toont al uw gezamenlijke aankopen met alle details.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reviews" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Beoordelingen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Na een voltooide gedeelde betaling kunnen beide deelnemers elkaar beoordelen met een sterrenbeoordeling (1-5 sterren) en optionele geschreven opmerking. Elke gebruiker kan slechts één keer per gedeelde betaling de andere deelnemer beoordelen.
            </p>
            <p className="text-sm text-muted-foreground">
              Gebruikersprofielen tonen automatisch de gemiddelde sterrenbeoordeling en het totaal aantal reviews. Reviews zijn zichtbaar voor alle gebruikers voor transparantie.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="folder" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Folder Synchronisatie</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              BuddyDeals integreert direct met officiële folder endpoints van alle acht supermarkten voor maximale nauwkeurigheid. Real-time synchronisatie zorgt voor actuele aanbiedingen, prijzen en productafbeeldingen.
            </p>
            <p className="text-sm text-muted-foreground">
              De app implementeert robuuste fallback en retry logica bij tijdelijk onbereikbare folder bronnen. Automatische herlaadlogica met exponentiële backoff zorgt voor betrouwbare data-ophaling. Timestamps en bronlabels tonen de actualiteit en herkomst van elke aanbieding.
            </p>
            <p className="text-sm text-muted-foreground">
              Wekelijkse automatische synchronisatie houdt alle folders up-to-date. De "Folder" pagina toont een geaggregeerde weergave van alle supermarktaanbiedingen in een scrollbare magazine-stijl layout.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="restart" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">App Herstarten</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              De "App Herstarten" knop in de header ververst alle data van de applicatie. Bij klikken wordt de volledige applicatie herstart, alle cache geleegd en verse data geladen van alle supermarkt folder-URLs.
            </p>
            <p className="text-sm text-muted-foreground">
              Tijdens het restart proces blijft u ingelogd (Internet Identity sessie behouden). De verplichte supermarkt selectie workflow wordt opnieuw geactiveerd indien nodig. Gebruik deze functie wanneer u de nieuwste aanbiedingen wilt zien.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="testlink" className="border rounded-2xl px-6 shadow-soft">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Testlink Delen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              De "Deel testlink" knop in de header toont een modal met de live preview URL van de app. U kunt de link kopiëren of de automatisch gegenereerde QR-code scannen om de app te testen.
            </p>
            <p className="text-sm text-muted-foreground">
              De QR-code heeft een groen-blauwe gestileerde frame consistent met BuddyDeals design. U kunt de QR-code downloaden als afbeelding met de downloadknop. Iedereen die de link opent kan deelnemen aan het testen door in te loggen met Internet Identity.
            </p>
            <p className="text-sm text-muted-foreground">
              Gedeelde gebruikers kunnen hun eigen profiel aanmaken, de verplichte supermarkt selectie workflow doorlopen, producten selecteren voor matching, en volledige app functionaliteit gebruiken.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="mt-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Ondersteunde Supermarkten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            BuddyDeals ondersteunt alle acht grote Nederlandse supermarkten met directe folder endpoint integratie:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Albert Heijn', 'Jumbo', 'Lidl', 'Dekamarkt', 'Aldi', 'Spar', 'Dirk', 'Deen'].map((name) => (
              <div key={name} className="p-3 rounded-xl bg-background border border-border/50 text-center">
                <p className="text-sm font-medium">{name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
