
var theStage = null;
var theSVG = null;
var svgSamplesTable = null;
var allSvgSamples = {};
var selectedEntry = null;
function initialize() {
    initDataTable();
    initSistineArea();
    initSVGArea();
    setupSplitBar();
    layout();
    $( window ).resize(function() { layout(); });
}

function setupSplitBar() {
    $("#splitbar").draggable({
        containment: "parent",
        axis: "x",
        drag: function(event) { layout(); }
    });
}

function layout() {
    var stage_div = $("#stage_div");
    var splitbar = $("#splitbar");
    var svg_area_div = $("#svg_area_div");

    // setup toolpanel width
    stage_div.width(splitbar.position().left);

    // setup stage_div width
    svg_area_div.css("left", splitbar.position().left + splitbar.width());

    if (theStage) { theStage.layout(); }
}


function initDataTable() {
    svgSamplesTable = $("#svg_samples_table").DataTable({
        paging: false,
        order: [1, "asc"],
        select: {
            style: "single"
        },
        "ajax": {
            "url": "/dir/src/demos/svgcmp/samples/", 
            "dataSrc": function ( json ) {
                var entries = json.entries;
                return entries.map(function(entry) {
                    allSvgSamples[entry.name] = entry;
                    return [entry.name, entry.stats.size];
                });
            }
        }
    });
    $('#svg_samples_table tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            svgSamplesTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            selectedEntry = $($(this).find("td")[0]).text().trim();
            loadSVG(selectedEntry);
        }
    } );
}

function initSistineArea() {
    theStage = new Sistine.Views.Stage("stage_div");
}

function initSVGArea() {
}

function loadSVG(entry) {
    console.log("Loading SVG: ", entry);
    var url = "/" + allSvgSamples[entry].file;
    loadSVGFromURL(url);
}

function loadSVGFromURL(url) {
}

