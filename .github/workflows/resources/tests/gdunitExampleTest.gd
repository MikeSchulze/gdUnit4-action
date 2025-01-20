extends GdUnitTestSuite


func before() -> void:
	assert_failure(func() -> void: assert_int(10).is_equal(42)) \
		.is_failed() \
		.has_line(5) \
		.has_message("Expecting:\n '42'\n but was\n '10'")


func after() -> void:
	assert_failure(func() -> void: assert_int(10).is_equal(42)) \
		.is_failed() \
		.has_line(12) \
		.has_message("Expecting:\n '42'\n but was\n '10'")


func before_test() -> void:
	assert_failure(func() -> void: assert_int(10).is_equal(42)) \
		.is_failed() \
		.has_line(19) \
		.has_message("Expecting:\n '42'\n but was\n '10'")


func after_test() -> void:
	assert_failure(func() -> void: assert_int(10).is_equal(42)) \
		.is_failed() \
		.has_line(26) \
		.has_message("Expecting:\n '42'\n but was\n '10'")


func test_get_line_number() -> void:
	# test to return the current line number for an failure
	assert_failure(func() -> void: assert_int(10).is_equal(42)) \
		.is_failed() \
		.has_line(34) \
		.has_message("Expecting:\n '42'\n but was\n '10'")


func test_get_line_number_yielded() -> void:
	# test to return the current line number after using yield
	await get_tree().create_timer(0.100).timeout
	assert_failure(func() -> void: assert_int(10).is_equal(42)) \
		.is_failed() \
		.has_line(43) \
		.has_message("Expecting:\n '42'\n but was\n '10'")


func test_get_line_number_multiline() -> void:
	# test to return the current line number for an failure
	# https://github.com/godotengine/godot/issues/43326
	assert_failure(func() -> void: assert_int(10)\
			.is_not_negative()\
			.is_equal(42)) \
		.is_failed() \
		.has_line(52) \
		.has_message("Expecting:\n '42'\n but was\n '10'")


@warning_ignore("unsafe_method_access")
func test_get_line_number_verify() -> void:
	var obj: RefCounted = mock(RefCounted)
	assert_failure(func() -> void: verify(obj, 1).get_reference_count()) \
		.is_failed() \
		.has_line(63) \
		.has_message("Expecting interaction on:\n	'get_reference_count()'	1 time's\nBut found interactions on:\n")


func test_is_null() -> void:
	assert_that(null).is_null()

	assert_failure(func() -> void: assert_that(Color.RED).is_null()) \
		.is_failed() \
		.has_line(72) \
		.starts_with_message("Expecting: '<null>' but was 'Color(1, 0, 0, 1)'")


func test_is_not_null() -> void:
	assert_that(Color.RED).is_not_null()

	assert_failure(func() -> void: assert_that(null).is_not_null()) \
		.is_failed() \
		.has_line(81) \
		.has_message("Expecting: not to be '<null>'")


func test_is_equal() -> void:
	assert_that(Color.RED).is_equal(Color.RED)
	assert_that(Plane.PLANE_XY).is_equal(Plane.PLANE_XY)

	assert_failure(func() -> void: assert_that(Color.RED).is_equal(Color.GREEN)) \
		.is_failed() \
		.has_line(91) \
		.has_message("Expecting:\n 'Color(0, 1, 0, 1)'\n but was\n 'Color(1, 0, 0, 1)'")


func test_is_not_equal() -> void:
	assert_that(Color.RED).is_not_equal(Color.GREEN)
	assert_that(Plane.PLANE_XY).is_not_equal(Plane.PLANE_XZ)

	assert_failure(func() -> void: assert_that(Color.RED).is_not_equal(Color.RED)) \
		.is_failed() \
		.has_line(101) \
		.has_message("Expecting:\n 'Color(1, 0, 0, 1)'\n not equal to\n 'Color(1, 0, 0, 1)'")


@warning_ignore("unsafe_method_access")
func test_override_failure_message() -> void:
	assert_failure(func() -> void: assert_that(Color.RED) \
			.override_failure_message("Custom failure message") \
			.is_null()) \
		.is_failed() \
		.has_line(109) \
		.has_message("Custom failure message")


func test_fail_on_request() -> void:
	if OS.get_environment("GDUNIT_FAIL") == "true":
		fail("expect the action is failing")
