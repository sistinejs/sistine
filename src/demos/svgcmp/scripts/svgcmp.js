
var Point = Sistine.Geom.Models.Point;
var Bounds = Sistine.Geom.Models.Bounds;

var DATASET_URLS = {
    'default': "/dir/src/demos/svgcmp/testsuites/samples/",
    'svg1.1': "/dir/src/demos/svgcmp/testsuites/svg1.1/svg/"
};
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

    if (theStage) { 
        theStage.layout(); 
        var svg = theStage.scene.childAtIndex(0);
        if (svg) {
            var width = theStage.element.width();
            var height = theStage.element.height();
            svg.setBounds(new Bounds(0, 0, width, height));
            theStage.paneNeedsRepaint();
        }
    }
}


function initDataTable() {
    svgSamplesTable = $("#svg_samples_table").DataTable({
        paging: false,
        order: [1, "asc"],
        searching: false,
        select: {
            style: "single"
        },
        "ajax": {
            "url": "/dir/src/demos/svgcmp/testsuites/samples/", 
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
    var params = Sistine.Utils.String.getUrlParams();
    if ("q" in params) {
        $("#svg_filter").val(params["q"].trim());
    }
    if ("dataset" in params) {
        var dataset = params["dataset"].trim();
        $("#svg_samples_dataset").val(dataset);
        selectDataSet(dataset)
    }
    $("#svg_samples_dataset").on("change", function(data) {
        var dataset = $(this).find("option:selected").attr('value');
        selectDataSet(dataset);
    });
    $("#svg_filter").on("change", applySearch);
}

function applySearch() {
    var filter = $("#svg_filter").val().trim();
    if (filter.length == 0) {
        // clear it
        svgSamplesTable.columns(0).search(filter);
    } else {
        svgSamplesTable.columns(0).search(filter);
    }
}

function selectDataSet(dataset) {
    dataset = dataset.trim();
    url = DATASET_URLS[dataset];
    svgSamplesTable.ajax.url(url).load(applySearch);
}

function initSistineArea() {
    theStage = new Sistine.Views.Stage("stage_div");
}

function initSVGArea() {
}

function loadSVG(entry) {
    var url = "/" + allSvgSamples[entry].file;
    loadSVGFromURL(url);
}

function loadSVGFromURL(url) {
    console.log("Loading SVG from URL: ", url);
    $("#svg_area_div").empty();

    var useIframe = false;
    if (useIframe) {
        var $iframe = $("<iframe src = '" + url + "'/>");
        $iframe.attr("width", "100%");
        $iframe.attr("height", "100%");
        $("#svg_area_div").append($iframe);
    }
    Sistine.SVG.Loader.loadFromURL(url, {}, function(shape, svg) {
        if (!useIframe) {
            var $svg = $(svg);
            $svg.attr("width", "100%");
            $svg.attr("height", "100%");
            $("#svg_area_div").append($svg);
        }
        theStage.scene.removeAll();
        var width = theStage.element.width();
        var height = theStage.element.height();
        shape.setBounds(new Bounds(0, 0, width, height));
        theStage.scene.add(shape);
        theStage.paneNeedsRepaint();
    });
}

