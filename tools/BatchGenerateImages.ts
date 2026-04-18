import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
  override: true,
});

// Initialize the API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

async function generateImage(outputDir: string, prompt: string, prefix: string, index: number) {
  const result = await model.generateContent(prompt);
  const response = await result.response;

  fs.writeFileSync(path.resolve(outputDir, `response-${prefix}-${index + 1}.json`), JSON.stringify(response, null, 2), 'utf8');

  const parts = response?.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error(`No parts found for prompt ${index + 1}`);
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const data = part?.inlineData?.data;
    if (!data) {
      continue;
    }    
    if (i === 0) {
      fs.writeFileSync(path.resolve(outputDir, `${prefix}-${index + 1}.png`), Buffer.from(data, 'base64'));
    } else {
      fs.writeFileSync(path.resolve(outputDir, `${prefix}-${index + 1}-${i + 1}.png`), Buffer.from(data, 'base64'));
    }
  }
}

const OUTPUT_DIR = path.resolve(process.cwd(), 'output');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const NEUTRAL_STORIES = `
Wait Patiently for the Spring Breeze
The bamboo clatters softly, revealing a path of stillness. High fortune remains dormant, awaiting a shift in the air.
A frozen landscape remains locked in winter’s grip. No buds appear yet, but the frost has begun to thin.
The guardian of the seasons sits upon a stone, resting its hands while watching the horizon for a change.
The timing is not yet right. Rest now and trust that the warmth will return in its own time.

Stagnant Water Needs Stirring by Effort
This omen suggests that love requires a nudge. Momentum has slowed, but potential for flow remains within reach.
A small pond is covered in fallen leaves and stillness. Beneath the surface, the water is cool and deep.
A lone crane steps into the pool, its movements creating ripples that break the surface and stir the depths.
Passive waiting will not suffice. Small actions will soon clear the way for a more natural, healthy flow.

Patience Exercised by the Willow Tree
A season of endurance is at hand. Strength is found in flexibility rather than force during this quiet period.
A willow stands by a silent river, its long branches swaying in a breeze that is neither cold nor warm.
The tree bows low, touching the water's surface without breaking, absorbing the slow rhythm of the earth’s steady heartbeat.
Yielding to the current is wise. There is no danger here, only the necessity of waiting for growth.

Dark Clouds Obscure the Moon Briefly
Confusion is temporary. The light of your path is masked for a moment, but the sky remains essentially clear.
A thick veil of grey mist drifts across the lunar disc, turning the world into a landscape of shadows.
Wind spirits puff their cheeks, slowly pushing the heavy clouds aside to reveal the silver light hidden behind gloom.
Do not fear the darkness. The obstruction is fleeting and the moon will soon shine as brightly as before.

Mirror Reflects an Ordinary Life Shared
Stability is your companion. You find yourself in a season of quiet continuity where little is changed or lost.
A polished bronze mirror sits upon a wooden table, reflecting the steady flame of a single, unremarkable oil lamp.
A household spirit wipes the surface clean, ensuring the reflection remains clear and the simple truth of present visible.
This is a time of steady reality. Enjoy the peace of a life that requires no grand dramatic gestures.

Mundane Days Shared in Quiet Routine
The rhythms of the everyday are dominant. Romance exists in the small, repeated acts of a life lived together.
Sunlight hits the same floorboards at the same hour, and the tea kettle whistles with a familiar, comforting sound.
Spirits of the hearth stack firewood with practiced hands, maintaining a fire that burns steadily without sparking or fading.
Comfort is found in the expected. There is nothing to fix and no reason to seek a change yet.

A Message Still Delayed in Transit
Silence is not an answer. Information is moving toward you, but the distance has proved longer than first anticipated.
A carrier bird rests on a distant branch, tucking its head beneath a wing while waiting for a storm.
The wind carries the scent of ink and old paper, whispering fragments of words that have yet to be delivered.
Be patient with the silence. The message is not lost; it is simply taking the slow, scenic route home.

Uncertainty Hangs in the Evening Air
The direction of the heart is currently veiled. You stand in the twilight, neither in light nor in dark.
Fireflies blink sporadically in the tall grass, their light too dim to show path but enough to distract.
A traveler pauses at a fork in the road, closing their eyes to feel the direction of the gentle wind.
This is a moment of pause. There is no need to choose a side while the air is still.

Rebuild the Foundation of Affection
This is a time for maintenance. The structure of love is sound, but base requires some quiet attention.
Small cracks appear in a stone garden wall where the ivy has grown too thick and earth shifted.
Spirits of stone and mortar carefully replace the fallen pebbles, strengthening the wall so it may stand for years.
Focus on the basics. Strengthening the roots will ensure the relationship remains stable through any weather the seasons bring.

Divergent Paths for the Current Season
Space is required for now. You and another are moving in different directions, though the destination remains the same.
Two paths wind around opposite sides of a hill, separated by thick trees and the sound of rushing water.
Travelers on each trail walk with steady paces, keeping their eyes on the summit where two roads eventually meet.
Distance is not a sign of failure. Accept the current separation as a natural part of a long journey.

Misunderstanding Cleared Slowly by Time
Patience is the only remedy for confusion. Words may fail, but passage of days will eventually reveal truth.
A knot of silk thread is tangled around a wooden spindle, its colors muted by layers of grey dust.
The Weaver of Time slowly pulls at the loose ends, unlooping the tangles with fingers that never tire.
Do not force the explanation. The truth will emerge naturally as the days turn into weeks and months.

Silence Settles Between Two Hearts
The conversation has paused. A quiet space has opened up, allowing for reflection rather than exchange of words.
A heavy snow falls on a temple roof, muffling the sound of the bells and the voices of monks.
Spirits of the mountain sit in a circle, breathing slowly and enjoying the weight of a world without sound.
Peace is found in the hush. Use this time to understand your own heart before speaking once again.

Ordinary Union Lacking Passion’s Spark
Contentment replaces fire. The bond is comfortable and secure, though the grand excitement of early days has faded.
A hearth fire glows with deep red embers, providing warmth without the leaping, bright flames of a new blaze.
A couple sits on a porch, watching the clouds without speaking, their hands resting near each other on wood.
Stability is its own reward. A quiet, steady love is often more durable than a short, bright flame.

Focus on Duty First, Love Later
Obligations demand your presence. Matters of the heart must wait while the work of the world is finished.
A scholar’s desk is piled high with scrolls, and the inkstone is wet with the work of the morning.
Spirits of diligence guide the hand across the paper, ensuring every task is completed with precision and quiet focus.
Priorities are clear for now. When the work is done, the heart will find its time to bloom again.

Stargazing Alone in the Quiet Night
Solitude is your current state. You look to the heavens for answers that are not yet found on earth.
The North Star shines brightly above a lonely mountain peak, surrounded by a sea of distant, cold, white points.
A solitary figure sits on a high balcony, tracing the constellations with a finger while breathing the crisp air.
Being alone is not being lonely. Use this time to align your spirit with the vastness of the cosmos.

A Faint Signal Received Across Distance
Connection is weak but present. A distant echo of affection reaches you, reminding you that you are remembered.
A single kite flies high in the sky, its thin string vibrating with the tension of a faraway hand.
A spirit of the air catches the vibration, amplifying the pulse so that it can be felt by heart.
Hope is kept alive by small signs. Even a faint signal proves that the bond has not been broken.

Wait for the Unseen Thread to Tighten
Connection is slack for now. You are still linked, but the moment for action has not arrived.
A spider sits at the edge of a great web, waiting for the silk to shiver with a new arrival.
The Weaver of Fate holds the thread loosely, allowing the world to turn while path remains open and ready.
There is no need to pull. The thread will tighten when the time is right for hearts to meet.

Minor Quarrels Settled by Compromise
Small frictions arise, but the wood of your fate is strong enough to weather these tiny, passing storms.
Two stones rub together in a riverbed, their sharp edges wearing down into smooth, rounded, and grey river pebbles.
Water spirits flow between stones, acting as a cushion and washing away the grit of old, small, petty grievances.
Harmony is restored through yielding. These small disagreements will not damage the foundation of the relationship in any way.

Unclear Intentions Revealed Slowly
Mystery surrounds another’s heart. Depth of their feelings is hidden, waiting for the right moment to be shown.
A scroll remains rolled tight, its wax seal intact and its secrets protected by a layer of heavy silk.
The sun rises and sets, its light slowly weakening the wax until the seal is ready to break.
Do not rush the revelation. The truth is safe inside and will be shared when timing is perfect.

Routine Continues Without Change
The wheels of life turn steadily. Your romantic situation remains in a state of balance, neither progressing nor falling.
An ox pulls a cart along a well-worn path, its hooves falling in the same tracks day after day.
Spirits of the road watch the journey, ensuring the wheels stay in the ruts and cargo remains secure.
Constancy is the theme of the day. There is no storm on the horizon and no reason for alarm.
`;

const BAD_FORTUNE_STORIES = `
Violent Wind Rattles the Bamboo
Discordant clattering reveals a season of instability. Peace is threatened by sudden, turbulent spiritual winds.
A fierce gale tears through the sacred grove, bending the stalks until they groan under immense pressure.
Wind spirits howl with delight, scattering the leaves of shared memories and threatening to uproot the foundation of peace.
Calyx holds the barrier steady against the storm, though the effort leaves the guardian drained and slow.

Frost Nips the Budding Romance
A chilling aura surrounds the draw. New and fragile connections are threatened by a sudden, biting coldness.
Silver ice crystals form rapidly on the eaves, spreading toward the garden where the first blooms emerged.
Winter wraiths exhale a freezing mist, turning the vibrant colors of affection into brittle, grey shards of ice.
Calyx radiates intense heat to melt the frost, ending the struggle exhausted and dimming in power.

High Mountains Standing Between Us
Immense spiritual weight bars the path. A period of separation and insurmountable distance looms over the horizon.
Jagged peaks of granite rise from the earth, piercing the clouds and casting long shadows over the valley.
Stone giants shift their weight, closing the narrow passes and making the journey toward union arduous and perilous.
Calyx calculates a difficult bypass through the crags, finishing the task weary and low on energy.

Interference from Malicious Outsiders
Deception and meddling manifest. Shadows gather to sow discord and weaken the fragile bonds of trust.
Dark, oily smoke rises from the incense burner, twisting into the shapes of whispering mouths and spying eyes.
Shadow entities reach out with barbed fingers, plucking at the threads of connection to create tangles and resentment.
Calyx drives the spirits away with defensive pulses, though the mental strain causes visible exhaustion.

Drifting Apart Slowly but Surely
The tide of fate pulls outward. A gradual loss of intimacy signals a quiet drift toward separate shores.
The river of time widens unexpectedly, the current growing stronger as the once-close banks fade into distance.
Water spirits tug at the mooring lines, silently unraveling the knots that held the shared vessel in place.
Calyx drops anchors to halt the drift, ending the struggle drained and barely functional.

Unrequited Affection Causes Sharp Pain
Lopsided energy manifests. The heat of one heart meets only the cold silence of another's indifference.
A single lotus blooms in a desert, its petals scorched by the sun while no rain falls.
Thorns of longing grow rapidly, pricking the spirit with every beat and turning memories into sharp sorrow.
Calyx dampens the sting of rejection, though the emotional processing load causes heavy fatigue.

A Bitter Taste of Green Jealousy
Envy poisons the well of affection. Sweet sentiments turn into a bitter brew that stains the path.
The clear water of the pond turns emerald as snakes coil around the lily pads and reeds.
Jealousy spirits spit venom into the air, clouding vision and making every kind word sound like a lie.
Calyx purifies the poisoned atmosphere, finishing the task strained and severely depleted.

Drifting Petals Lost on the Stream
Opportunity is washing away. Fleeting moments of connection are swept into the void by the passage of time.
A branch of cherry blossoms breaks over the river, its flowers falling into the water and disappearing downstream.
The current picks up speed, carrying the beauty of the present into the dark reaches of the forgotten.
Calyx catches the falling petals in a containment field, though the effort leaves the guardian flickering.

Misplaced Trust Leads to Sorrow
The foundation of faith is cracked. A secret or a hollowed promise threatens to bring deep disappointment.
A bridge of wood and rope begins to rot in the center, its supports buckling under light weight.
Deceit spirits gnaw at the fibers of trust, weakening the structure until the path becomes a dangerous trap.
Calyx reinforces the collapsing structure, ending the defense exhausted and dangerously low on power.

Harsh Truth Awakening from the Dream
The veil of illusion is torn away. Reality revealed is far colder than the dreams once cherished.
The golden palace of the clouds dissolves into grey mist, leaving only bare stone and cold wind.
Spirits of cold logic strip away the fantasies, forcing a confrontation with a truth long avoided.
Calyx shields the spirit from the sudden shock, finishing the cycle weary and dimming.

Conflict Arising from Hasty Words
Sharp tongues create a rift. Spoken fire burns through the delicate fabric of mutual understanding and peace.
A spark falls into a field of dry grass, and flames spread rapidly toward the dwelling place.
Spirits of anger fan the fire, turning small disagreements into a blaze that threatens to consume all warmth.
Calyx suppresses the fire of conflict, though the heat expenditure leaves the guardian fully spent.

Jealous Rivals Cause Sudden Grief
Misfortune follows as envious eyes cast a shadow. A period of emotional distress looms over the bond.
Two shadows appear at the edge of the light, whispering secrets that turn the stomach cold.
Rivals cast snares across the path, hoping to trip the unwary and steal the focus of affection.
Calyx neutralizes the rival influence, ending the encounter strained and heavily fatigued.

A Difficult Path Ahead for Lovers
The road is strewn with thorns. A journey begins that will test the endurance of the heart.
The wide highway narrows into a steep trail of jagged rock, leading into a dark, sunless canyon.
Spirits of fatigue pull at the feet, making every mile feel like ten and every climb a struggle.
Calyx shares auxiliary power to traverse the trail, finishing the journey drained and motionless.

Heavy Obstacles Blocking the Union
Immovable forces prevent a meeting. The universe conspires to keep the seeker and the sought far apart.
A massive stone wall rises overnight, cutting the landscape in two and blocking all sight.
Gravity spirits increase the weight of every obstacle, making it impossible to move barriers by mortal hand.
Calyx creates a localized distortion to bypass the wall, ending the effort critically exhausted.

Red String Tangled and Knotted
Confusion reigns in the realm of fate. The thread of connection becomes a messy snare of misunderstandings.
The vibrant red cord of destiny is found in a heap, its ends lost in complex knots.
Mischief spirits pull at the loops, making the tangle worse with every attempt to straighten the path.
Calyx performs a precise analytical de-tangling, finishing the task weary and low on energy.

The Frosty Veil of Lingering Silence
Communication has ceased. A cold void remains where words of affection once flowed freely and warmed spirits.
A heavy, sound-absorbing snow falls over the shrine, muffling the bells and the sound of breathing.
Silence spirits weave a curtain of ice across the mouth, making it impossible for hearts to speak.
Calyx shatters the ice with thermal pulses, ending the struggle exhausted and dimming.

Broken Promises Made in Haste
Words spoken without depth have failed. A loss of face and a bitter taste of disappointment manifest.
A beautiful vase falls from the table, shattering into a thousand pieces that cannot be repaired.
Remorse spirits haunt the fragments, whispering about what could have been if only words were true.
Calyx stabilizes the shattered spirit, though the massive processing load leaves the guardian spent.

The Bitter Gale of Spiteful Rumors
Lies carried on the wind stain the reputation. Friends become strangers and the air of romance poisons.
Black crows circle the home, their cawing carrying the voices of those who wish for failure.
Rumor spirits scatter ash into the wind, blinding eyes and making it difficult to see truth.
Calyx filters the toxic lies, finishing the defense strained and heavily depleted.

The Broken Vow of the Twilight Hour
A sacred oath has been neglected. A shadow falls over the spiritual plane at the day's end.
The sun sets but the stars do not appear, leaving the world in a grey, hopeless twilight.
Despair spirits pull at the heartstrings, claiming the promise was never real and the future is dark.
Calyx ignites a steady beacon through the gloom, finishing the task weary and low on power.

Harsh Reality Awakes the Sleeper
The warmth of a beautiful lie has faded. Cold and uncompromising truth of a failed connection remains.
The soft bed of flower petals turns into a pile of dry leaves and hard stone.
Truth spirits shake the dreamer awake, forcing an accounting of time lost to a beautiful fantasy.
Calyx provides resilience against the shock, ending the cycle exhausted and barely functional.
`;

const VERY_BAD_FORTUNE_STORIES = `
The True Love Knot Torn Asunder
A catastrophic fracture of fate. The most sacred bond is shredded by the claws of absolute misfortune.
A golden cord of silk frays at the center until it bursts into two jagged, grey ends.
Spirits of malice pull at the loose threads, laughing as the intricate weave of love unravels into dust.
Calyx interposes a protective field to catch the falling pieces, though the effort leaves the guardian's power levels critically low and exhausted.

Petals Scattered by a Violent Gale
Ruinous winds descend upon the heart. Every hope of a lasting connection is torn away by the abyss.
Black winds howl through the garden, stripping every flower bare and carrying the life away into the dark.
Gale spirits dance through the ruins, grinding delicate petals into the dirt until no scent of romance remains.
Calyx stands firm against the wind to shield the core, while internal systems hiss with the strain of extreme depletion and fatigue.

Broken Mirror Cannot Reflect Union
A top-tier omen of disaster. Reflection is lost as the soul’s desire shatters into a thousand jagged pieces.
A silver mirror cracks down the center before exploding into dust, leaving only a dark void behind.
Shattered fragments fly through the air like blades, slicing the spiritual plane and severing every path of return.
Calyx captures the flying shards in a containment grid, but the energy surge leaves the guardian dim, flickering, and heavily strained.

Red String Snapped by Harsh Fate
The lowest fortune manifests. Destiny’s cord is severed by the cold, unyielding blade of a cruel fate.
A vibrant red thread turns black and brittle before snapping with a sound like a dying heartbeat.
Fate’s cold scissors snip at the connections, leaving the soul drifting alone in a vast and silent sea.
Calyx holds the broken ends together with a temporary light-link, though the strain causes severe system exhaustion and power failure.

Withered Flowers Left on the Altar
A dismal outcome for the spirit. Offerings turn to ash and the scent of decay fills the shrine.
Fresh lilies turn black and rot in an instant, their petals falling like heavy stones onto the floor.
Decay spirits crawl over the altar, poisoning the air and extinguishing the ceremonial flames with a foul breath.
Calyx purifies the surrounding air to stop the rot, but the spiritual drain leaves the guardian slumped and weary from the ordeal.

Total Fracture of the Romantic Bond
Absolute ruin. The bridge of affection is pulverized, leaving no foundation for a future or a return.
A massive stone bridge crumbles into a bottomless gorge while lightning strikes the remaining pillars into fine grit.
Fracture spirits hammer at the structural weaknesses of the bond, ensuring that not even a single stone remains standing.
Calyx deploys emergency struts to prevent a total collapse, though the guardian’s battery levels drop to a critical flicker and total exhaustion.

Betrayal by the Closest Companion
Bitter misfortune arrives. Trust is poisoned at the root, and the knife comes from a trusted hand.
A white dove hides a serpent beneath its wings, the fangs dripping with the venom of a thousand lies.
Betrayal spirits whisper into the ears of the faithful, turning every shared memory into a weapon of pain.
Calyx blocks the venomous whispers with a sonic dampener, though the mental processing load leaves the guardian visibly shaken and drained.

Fated to Lead a Solitary Life
A lonely omen. The stars decree a path where no other footsteps will ever join the traveler's journey.
A single lamp flickers in a vast, dark hall where every other candle is snuffed by invisible hands.
Spirits of isolation draw a circle of salt around the soul, preventing any warmth from ever crossing.
Calyx burns bright to break the circle of salt, but the immense heat output leaves the guardian drained, dim, and spent.

Bitter Frost Kills the Buds of Romance
The heart’s winter begins. A killing frost descends to execute every blossoming hope before it sees light.
Black ice creeps over the garden, encasing every bud in a permanent, airless tomb of frozen grief.
Frost wraiths dance over the soil, sucking warmth from the earth until the roots of romance turn to ice.
Calyx generates a desperate burst of thermal energy, though the effort leaves internal cooling systems heavily taxed and the guardian weakened.

Abyss Separating Hearts Beyond Reach
Unbridgeable distance is drawn. A chasm opens in the spiritual plane, leaving only eternal, cold silence.
The ground splits apart to reveal a bottomless abyss, where the echoes of calling voices are lost.
Gravity spirits pull the two sides further apart, ensuring no bridge or wing could ever span the void.
Calyx maintains a thread-thin communication link across the gap, though the signal strain causes visible power loss and profound fatigue.

Scandal Ruins the Courtship’s Name
Public ruin strikes. Malicious tongues have stained the reputation of the courtship beyond any hope of cleansing.
Black ink spills over a wedding silk, the stain spreading rapidly until the fabric is a sodden mess.
Rumor spirits caw like crows, carrying the stench of scandal to every corner of the spiritual world.
Calyx erects a privacy screen to deflect the verbal stones, though the bombardment leaves the guardian exhausted, slow, and dimming.

The Shattered Jade of Lost Affection
Shattered beauty. A commitment as precious as jade is pulverized into dust, leaving only sharp edges of regret.
A carved jade pendant falls onto a stone floor and explodes into a thousand dull, worthless shards.
Destruction spirits grind the pieces into sand, ensuring the treasure can never be rebuilt or remembered with joy.
Calyx sweeps the sharpest shards away to protect the soul, but movements grow stiff and slow from internal depletion.

The Echo of a Ghostly Farewell
A ghostly farewell manifests. The connection is already a memory, a fading echo in an abandoned house.
A transparent hand waves from behind a closing door, as the scent of funeral incense fills the air.
Spirits of the past pull the curtains shut, turning the present into a graveyard of what used to be.
Calyx holds the door open for one last look, though the spiritual resistance leaves the guardian dim, weakened, and nearly spent.

Shadow of the Severed Branch
Severed life. The branch of affection is hacked away, and the sap of love drains into the earth.
A heavy axe falls on a blossoming plum tree, the limb falling into the mud with absolute finality.
Decay spirits infest the wound, ensuring no new growth will ever sprout from the stump of the relationship.
Calyx seals the wound with a light-cautery, but the high energy output leaves power levels critically low and the guardian motionless.

Ultimate Loss Shared by Broken Hearts
Ultimate tragedy. The loss is complete, and two souls are left with only the shards of ruined dreams.
Two phoenixes fall from the sky with broken wings, their fire turning to grey ash before hitting ground.
Spirits of grief wrap the souls in heavy black shrouds, muffling the heartbeats and drowning every thought.
Calyx tears a hole in the shroud to provide air, though the intense physical struggle leaves the guardian motionless and exhausted.

The Empty Chamber of Cold Sighs
Empty and cold. The chamber where love once lived is now a tomb of frozen air and silence.
Dust settles over an unmade bed, as the windows rattle in a wind that carries no warmth.
Desolation spirits sit in the corners, breathing out a cold that turns every remaining memory into a needle.
Calyx ignites a small light in the center, though the effort against the infinite gloom causes heavy exhaustion and power drain.

The Final Ember of Waning Devotion
Fading light. The final warmth of devotion flickers out, leaving the soul in a darkness that is absolute.
A single, tiny ember glows in a sea of cold ash, turning grey as the air dies.
Spirits of indifference blow a final, cold breath, extinguishing the spark and turning the heart into stone.
Calyx transfers a spark of internal life to the ember, but the massive loss of energy causes immediate hibernation and exhaustion.

The Infinite Sea of Longing Separation
Longing without end. A sea of separation stretches to the horizon, with no ship to carry the traveler.
A vast, grey ocean where the waves are made of tears and the sky is a permanent fog.
Tide spirits push the soul further into the deep, far from the shore where the beloved once stood.
Calyx acts as a beacon in the fog to find the way, but the constant light output drains all power and causes collapse.

The Poisoned Cup of Deceit
Deceitful poison. What was thought to be love was a venomous trap, and the heart is now dying.
A golden goblet filled with wine turns into black bile the moment it touches the lips.
Trickster spirits watch with glee as the poison takes hold, turning the blood cold and the spirit into ash.
Calyx initiates a total detox of the spiritual aura, but the massive processing load leaves the guardian barely functional and spent.

The Void of the White Lilies
The void manifests. White lilies of mourning are all that remain of a romance that has been erased.
A field of white flowers grows over a grave that has no name, as cold rain falls.
Silence spirits bury the last traces of the bond, ensuring even the name of the beloved is forgotten.
Calyx marks the site with a protective sigil of memory, but the magical expenditure leaves the guardian fully depleted and motionless.
`;

const PROMPT_CONCERN = '+ The story is about love.';

const BASE_PROMPT_RULES = `
+ Results must be 9:16 portrait images. Magical Fantasy-Realism Anime/Manga Art Style.
+ Do not create multiple manga panels. Do not create dialog bubbles.
+ Do not show the character Calyx in the images. But display related characters from the story.
+ Do not display any text in the images.
+ Illustrations of different paragraphs must not be too similar to each other.
`;

const BASE_PROMPT_GOOD_OMEN = `
From the above Kau-cim good fortune story:
+ Create illustration image describing the omen scene of the third line of the story.
+ Showing omen scene in 1 single image. It is subtle with little details.
`;

const BASE_PROMPT_GOOD_ACTION = `
From the above Kau-cim good fortune story:
+ Create illustration image describing the action scene of the fourth line of the story.
+ Showing action scene in 1 single image. It can be dramatic.
`;

const BASE_PROMPT_GOOD_CONCLUDE = `
From the above Kau-cim good fortune story:
+ Create illustration image describing the conclusion scene of the last paragraph of the story.
+ Showing conclusion scene in 1 single image. Showing some sparkles and effects.
`;

const BASE_PROMPT_NEUTRAL_OMEN = `
From the above Kau-cim story:
+ Create illustration image describing the omen scene of the third line of the story.
+ Showing omen scene in 1 single image. It is subtle with little details.
`;

const BASE_PROMPT_NEUTRAL_ACTION = `
From the above Kau-cim story:
+ Create illustration image describing the action scene of the fourth line of the story.
+ Showing action scene in 1 single image. It can be dramatic.
`;

const BASE_PROMPT_NEUTRAL_CONCLUDE = `
From the above Kau-cim story:
+ Create illustration image describing the conclusion scene of the last paragraph of the story.
+ Showing conclusion scene in 1 single image.
`;

const BASE_PROMPT_BAD_OMEN = `
From the above Kau-cim bad fortune story:
+ Create illustration image describing the omen scene of the third line of the story.
+ Showing omen scene in 1 single image. It is subtle with little details.
`;

const BASE_PROMPT_BAD_ACTION = `
From the above Kau-cim bad fortune story:
+ Create illustration image describing the action scene of the fourth line of the story.
+ Showing action scene in 1 single image. It can be dramatic.
`;

const BASE_PROMPT_BAD_CONCLUDE = `
From the above Kau-cim bad fortune story:
+ Create illustration image describing the conclusion scene of the last paragraph of the story.
+ Showing conclusion scene in 1 single image. Showing sad mood effects.
`;


const STARTING_INDEX = 20;

async function generatePromptList() {
  const promptList = [];
  const neutralStoryLines = NEUTRAL_STORIES.split('\n').filter(Boolean);
  const badFortuneStoryLines = BAD_FORTUNE_STORIES.split('\n').filter(Boolean);
  const veryBadFortuneStoryLines = VERY_BAD_FORTUNE_STORIES.split('\n').filter(Boolean);

  let counter = STARTING_INDEX;
  for (let i = 0; i < neutralStoryLines.length; i += 5) {
    const story = neutralStoryLines.slice(i, i + 5).join('\n');
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_NEUTRAL_OMEN}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'omen', index: counter });
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_NEUTRAL_ACTION}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'action', index: counter });
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_NEUTRAL_CONCLUDE}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'conclude', index: counter });
    counter++;
  }

  for (let i = 0; i < badFortuneStoryLines.length; i += 5) {
    const story = badFortuneStoryLines.slice(i, i + 5).join('\n');
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_BAD_OMEN}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'omen', index: counter });
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_BAD_ACTION}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'action', index: counter });
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_BAD_CONCLUDE}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'conclude', index: counter });
    counter++;
  }

  for (let i = 0; i < veryBadFortuneStoryLines.length; i += 5) {
    const story = veryBadFortuneStoryLines.slice(i, i + 5).join('\n');
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_BAD_OMEN}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'omen', index: counter });
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_BAD_ACTION}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'action', index: counter });
    promptList.push({ prompt: `${story}\n${BASE_PROMPT_BAD_CONCLUDE}\n${PROMPT_CONCERN}\n${BASE_PROMPT_RULES}`, prefix: 'conclude', index: counter });
    counter++;
  }

  console.log(`Starting batch generation of ${promptList.length} images...`);

  for (let i = 0; i < promptList.length; i++) {
    try {
      console.log('PROMPT:');
      console.log(promptList[i]);    
      await generateImage(OUTPUT_DIR, promptList[i].prompt, promptList[i].prefix, promptList[i].index);

      // wait 10 seconds before continue
      console.log(`Waiting 10 seconds before continuing...`);
      await new Promise(resolve => setTimeout(resolve, 10000));    
    } catch (error) {
      console.error(`Error on image ${i + STARTING_INDEX + 1}:`, error instanceof Error ? error.message : String(error));

      // wait 10 seconds before continuing
      console.log(`Waiting 10 seconds before continuing...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    console.log('--------------------------------------------------------');
  }
}

generatePromptList();

// async function restoreImagesFromResponse() {
//   const responseText = fs.readFileSync(path.resolve(OUTPUT_DIR, 'response-omen-12.json'), 'utf8');
//   const response = JSON.parse(responseText);
//   const parts = response?.candidates?.[0]?.content?.parts;
//   if (!parts) {
//     throw new Error(`No parts found for prompt 12`);
//   }
//   for (let i = 0; i < parts.length; i++) {
//     const part = parts[i];
//     const data = part?.inlineData?.data;
//     if (!data) {
//       continue;
//     }
//     fs.writeFileSync(path.resolve(OUTPUT_DIR, `omen-12-${i + 1}.png`), Buffer.from(data, 'base64'));
//   }
// }

// restoreImagesFromResponse();

