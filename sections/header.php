<?php
function showHeader($title) {
    global $DataYears;
?>
<a href="javascript: location.href=location.pathname">
<img src="pawstats.svg" onerror="this.src='pawstats.png'">
</a>
<h1 class='inline'><?php echo $title?></h1>
&nbsp;
<!-- ======================================================= -->
<form class='inline vsuper' action="/pawstats/PAWStats.php" method="get">
<input type="hidden" name="site" id="reqSite">
<select name="month" id="reqMonth" onchange="this.form.submit()">
    <option value="01">01</option>
    <option value="02">02</option>
    <option value="03">03</option>
    <option value="04">04</option>
    <option value="05">05</option>
    <option value="06">06</option>
    <option value="07">07</option>
    <option value="08">08</option>
    <option value="09">09</option>
    <option value="10">10</option>
    <option value="11">11</option>
    <option value="12">12</option>
</select>
<select name="year" id="reqYear" onchange="this.form.submit()">
<?php
foreach ($DataYears as $year) {
    echo "    <option value='$year'>$year</option>\n";
}
?>
</select>
</form>
<br>
<script>
    document.getElementById('reqSite').value=PAWStats.site;
    document.getElementById('reqMonth').value=PAWStats.month;
    document.getElementById('reqYear').value=PAWStats.year;
</script>
<?php
}
?>
