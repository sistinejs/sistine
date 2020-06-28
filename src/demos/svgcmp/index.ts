import { Shape } from "../../lib/Core/models";
import { Bounds } from "../../lib/Geom/models";
import { Stage } from "../../lib/Views/stage";
import { Utils } from "../../lib/Utils/index";
import { loadFromURL } from "../../lib/SVG/loader";
import { SVG } from "../../lib/SVG/models";

const DATASET_URLS = {
  default: "/dir/src/demos/svgcmp/testsuites/samples/",
  "svg1.1": "/dir/src/demos/svgcmp/testsuites/svg1.1/svg/",
};

export class App {
  stage: Stage;
  theSVG = null;
  svgSamplesTable: any = null;
  allSvgSamples: any = {};
  selectedEntry: any = null;

  constructor() {
    this.initDataTable();
    this.initSistineArea();
    this.initSVGArea();
    this.setupSplitBar();
    this.layout();
    var self = this;
    $(window).resize(function () {
      self.layout();
    });
  }

  setupSplitBar() {
    var self = this;
    ($("#splitbar") as any).draggable({
      containment: "parent",
      axis: "x",
      drag: function () {
        self.layout();
      },
    });
  }

  layout() {
    var stage_div = $("#stage_div");
    var splitbar = $("#splitbar") as any;
    var svg_area_div = $("#svg_area_div");

    // setup toolpanel width
    stage_div.width(splitbar.position().left);

    // setup stage_div width
    svg_area_div.css("left", splitbar.position().left + splitbar.width());

    if (this.stage) {
      this.stage.layout();
      var svg = this.stage.scene.childAtIndex(0) as Shape;
      if (svg) {
        var width = this.stage.element.width();
        var height = this.stage.element.height();
        svg.setBounds(new Bounds(0, 0, width, height));
        this.stage.paneNeedsRepaint();
      }
    }
  }

  initDataTable() {
    var self = this;
    this.svgSamplesTable = ($("#svg_samples_table") as any).DataTable({
      paging: false,
      order: [1, "asc"],
      select: {
        style: "single",
      },
      ajax: {
        url: "/dir/src/demos/svgcmp/testsuites/samples/",
        dataSrc: function (json: any) {
          var entries = json.entries;
          return entries.map(function (entry: any) {
            self.allSvgSamples[entry.name] = entry;
            return [entry.name, entry.stats.size];
          });
        },
      },
    });
    $("#svg_samples_table tbody").on("click", "tr", function () {
      if ($(this).hasClass("selected")) {
        $(this).removeClass("selected");
      } else {
        self.svgSamplesTable.$("tr.selected").removeClass("selected");
        $(this).addClass("selected");
        self.selectedEntry = $($(this).find("td")[0]).text().trim();
        self.loadSVG(self.selectedEntry);
      }
    });
    var params = Utils.String.getUrlParams();
    if ("q" in params) {
      $("#svg_filter").val(params["q"].trim());
    }
    if ("dataset" in params) {
      var dataset = params["dataset"].trim();
      $("#svg_samples_dataset").val(dataset);
      self.selectDataSet(dataset);
    } else {
      self.applySearch();
    }
    $("#svg_samples_dataset").on("change", function () {
      var dataset: string = $(this)
        .find("option:selected")
        .attr("value") as string;
      self.selectDataSet(dataset);
    });
    $("#svg_filter").on("keyup", function () {
      self.applySearch();
    });
  }

  applySearch() {
    var filter = ($("#svg_filter").val() as string).trim();
    if (filter.length == 0) {
      // clear it
      this.svgSamplesTable.search(filter).draw();
    } else {
      this.svgSamplesTable.search(filter).draw();
    }
  }

  selectDataSet(dataset: string) {
    dataset = dataset.trim();
    var url: string = (DATASET_URLS as any)[dataset] as string;
    this.svgSamplesTable.ajax.url(url).load(this.applySearch);
  }

  initSistineArea() {
    this.stage = new Stage("stage_div");
  }

  initSVGArea() {}

  loadSVG(entry: string) {
    var url = "/" + this.allSvgSamples[entry].file;
    this.loadSVGFromURL(url);
  }

  loadSVGFromURL(url: string) {
    console.log("Loading SVG from URL: ", url);
    $("#svg_area_div").empty();

    var useIframe = false;
    if (useIframe) {
      var $iframe = $("<iframe src = '" + url + "'/>");
      $iframe.attr("width", "100%");
      $iframe.attr("height", "100%");
      $("#svg_area_div").append($iframe);
    }
    loadFromURL(url, {}, function (shape: SVG, svg: HTMLElement) {
      if (!useIframe) {
        var $svg = $(svg);
        $svg.attr("width", "100%");
        $svg.attr("height", "100%");
        $("#svg_area_div").append($svg);
      }
      this.stage.scene.removeAll();
      var width = this.stage.element.width();
      var height = this.stage.element.height();
      shape.setBounds(new Bounds(0, 0, width, height));
      this.stage.scene.add(shape);
      this.stage.paneNeedsRepaint();
    });
  }
}

new App();
