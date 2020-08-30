let lastMonthTimestamp = {
    start: 1572566400,
    end:   1575158400
}

connection.query("SELECT SUM(confidence) as walking FROM entry "+
"INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId "+
"INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 "+
"INNER JOIN activity1connectactivity2 on activity1.aa1=activity1connectactivity2.a1 "+
"INNER JOIN activity2 on activity2.aa2=activity1connectactivity2.a2  "+
"WHERE type= 'ON_FEET' OR type='ON_BICYCLE' AND entry.userId='")