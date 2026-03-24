Create an interactive single-page app showing war events as vertical timeline, visualizing escallation / descalation.

Use this data format for event
- date
- title
- direction (Escalating / De-escalating / Neutral)
- short description
- source of information (url)
- actor

The chart is (temporally from most recent) showing escalating events on the left (in red) and descalation events on the right (in blue).
Each event is a dot with a label (title). It can be clicked to view more details (description, link to source, actor)

Events can be filtered by actors (multiple actors can be selected).
The colors (red / blue) can be changed to represent different actors - the resulting view shows which countries are involved in escalations and which are involved in descalations.

Create a Claude command that updates the data.

Include a "play" mode that automatically advances the timeline, keeping the view centered on the date of the current event at a speed so that the titles can be read by humans.

Starter events:
Date	Day	Event	Effect
Mar 13	14	Mojtaba Khamenei warns attacks will continue unless US bases close	Escalating
Mar 13	14	US claims new Supreme Leader Khamenei is wounded	Neutral
Mar 13	14	IDF strikes 200+ targets in Tehran, Shiraz, Ahvaz	Escalating
Mar 13	14	French soldier killed in Iranian UAV attack near Erbil	Escalating
Mar 14	15	Kata'ib Hezbollah commander Abu Ali al-Askari killed in Baghdad	Escalating
Mar 14	15	Royal Tulip Hotel in Baghdad hit during EU-Saudi delegation visit	Escalating
Mar 14	15	US claims Iran missile capability down 90%, drones down 95%	Neutral
Mar 15	16	IDF strikes Isfahan, killing 15	Escalating
Mar 15	16	IDF destroys Supreme Leader's aircraft at Mehrabad Airport	Escalating
Mar 15	16	France proposes Lebanon ceasefire plan with Israel recognition	De-escalating
Mar 16	17	NATO European nations reject Trump's call for military support	De-escalating
Mar 16	17	IDF strikes Tehran nuclear program sites	Escalating
Mar 17	18	Ali Larijani and Basij chief Gholamreza Soleimani killed	Escalating
Mar 17	18	Iran retaliates with cluster munitions, kills 2 in Ramat Gan	Escalating
Mar 17	18	Israel launches ground invasion of southern Lebanon	Escalating
Mar 17	18	Trump denounces NATO and Indo-Pacific allies for refusing support	Neutral
Mar 18	19	Israel strikes South Pars gas field (world's largest reserves)	Escalating
Mar 18	19	Iran retaliates against Qatar's LNG facility	Escalating
Mar 18	19	Iranian intelligence minister Esmaeil Khatib killed	Escalating
Mar 19	20	Brent crude hits $115/barrel	Neutral
Mar 19	20	Iran attacks Haifa oil refinery, disrupts operations	Escalating
Mar 19	20	Israel strikes Iranian naval targets in Caspian Sea (first time)	Escalating
Mar 20	21	IRGC spokesman Ali Mohammad Naeini eliminated	Escalating
Mar 20	21	Iranian drones hit Kuwait's Mina al-Ahmadi refinery	Escalating
Mar 20	21	Trump hints at "winding down" operations (rules out ceasefire)	De-escalating
Mar 21	22	Iran threatens UAE with "crushing blows"	Escalating
Mar 21	22	Iran attacks Diego Garcia base (3,800 km from Iran)	Escalating
Mar 21	22	22 nations express willingness to secure Strait of Hormuz	De-escalating
Mar 22	23	Iranian missiles hit Dimona and Arad near Israel's nuclear facility	Escalating
Mar 22	23	Israel bombs bridges in southern Lebanon	Escalating
Mar 22	23	Trump threatens to "obliterate" Iran's power plants within 48 hours	Escalating
Mar 23	24	Trump extends Hormuz deadline by 5 days, suspends energy strikes	De-escalating
Mar 23	24	Iran threatens complete Hormuz closure if power plants hit	Escalating
