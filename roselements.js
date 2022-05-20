// ============================= CONFIGURATION

// You can set here some parameters for the launch.
// In the lab we're using two different GPS, so further in the
// program, we're going to read rosparam to know what topic
// we should listen to and what is the number of cycles
// between each refreshing.

// The name of the GPS publisher name by default
var CONFIG_default_gps_topic_name = '/fix';
var CONFIG_default_markers_topic_name = '/region';
var CONFIG_default_people_topic_name = '/people';

// The number of cycles between every marker position reload
var CONFIG_cycles_number = 20;

// If you use local tiles, set here the path to it
var CONFIG_tile_local_path = 'UPV/{z}/{x}/{y}.png';

//  => Create param with initial value
var paramTopicNameValue = CONFIG_default_gps_topic_name;
var paramNbCyclesValue = CONFIG_cycles_number;

listenerGPS = new ROSLIB.Topic({
 ros : ros,
 name : paramTopicNameValue,
 messageType : 'sensor_msgs/NavSatFix'
});

// = > Camera Stuff
var image_topic = new ROSLIB.Topic({
  ros: ros,
	name: '/camera/color/image_raw/compressed',
	//name: '/nav_processed_image',
	//name: '/darknet_ros/detection_image',
	//name: '/usb_cam/image_raw/compressed',
	messageType: 'sensor_msgs/CompressedImage'
	//messageType: 'sensor_msgs/Image'
});

var map_topic = new ROSLIB.Topic({
  ros: ros,
	name: '/map_img/compressed',
	//name: '/nav_processed_image',
	//name: '/darknet_ros/detection_image',
	//name: '/usb_cam/image_raw/compressed',
	messageType: 'sensor_msgs/CompressedImage'
	//messageType: 'sensor_msgs/Image'
});

var serviceclient = new ROSLIB.Service({
  ros: ros,
  name: "/topological/edges",
  serviceType : "gr_action_msgs/GREdges2",
});


//TO BE DEPRECATED
//===> Init the routing parameters
var paramStartLat = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/start/latitude'
});
var paramStartLon = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/start/longitude'
});
var paramEndLat = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/destination/latitude'
});
var paramEndLon = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/destination/longitude'
});
var paramEndGoTo = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/destination/goTo'
});


listenerMarker = new ROSLIB.Topic({
  ros : ros,
  name : "/region",
  messageType : 'visualization_msgs/Marker'
});


var safetyTopic = new ROSLIB.Topic({
  ros : ros,
  name : "/safety_score",
  messageType : 'std_msgs/Float32'
});

// = > Perople Stuff
var detectionTopic = new ROSLIB.Topic({
  ros : ros,
  //name : "/pointcloud_lidar_processing/detected_objects",
  name: "/pointcloud_lidar_processing/found_object",
  //messageType : 'geometry_msgs/PoseArray'
  messageType : 'safety_msgs/FoundObjectsArray'

});


var start_service = new ROSLIB.Service({
    ros : ros,
    name : '/execute_remotely',
    serviceType : 'std_srvs/SetBool'
  });
