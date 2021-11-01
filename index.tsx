import React, { Component } from 'react';
import { View, Dimensions, Animated, PanResponder, Easing } from 'react-native';

interface IDrawerProps {
	onSlideEnd: Function;
	event?: string;
	backdropColor?: string;
	drawerStyle?: Object;
	drawerHandleColor?: string;
	useCustomDrawer?: boolean;
	noDrawerHandle?: boolean;
	backgroundHeight?: number;
	drawerHeight?: number;
	drawerBackgroundColor?: string;
	drawerOpenSpeed?: number;
}
interface IState {
	yPosition: number;
}
class SlidableDrawer extends Component<IDrawerProps, IState> {
	private animation = new Animated.Value(0);
	private childAnimation = new Animated.Value(0);
	private panResponder;
	constructor(props: IDrawerProps) {
		super(props);
		this.state = {
			yPosition: 0,
		};

		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: () => {
				return true;
			},
			onPanResponderMove: (e, gesture) => {
				this.setState({ ...this.state, yPosition: gesture.moveY });
				return Animated.event(
					[
						null,
						{
							dy: new Animated.ValueXY({
								x: gesture.moveX,
								y: gesture.moveY,
							}).y,
						},
					] as any,
					{ useNativeDriver: false }
				);
			},
			onPanResponderRelease: (evt, gestureState) => {
				if (gestureState.moveY > Dimensions.get('window').height - 400) {
					this.fireParentAnimation();
				}
			},
		});
	}

	finishedAnimation = () => {
		this.fireParentAnimation();
	};

	componentDidMount() {
		this.fireChildAnimation();
	}

	componentDidUpdate() {
		// if you want to create an event to close the whole drawer when
		if (this.props.event === 'close') {
			this.fireParentAnimation();
		}
	}

	fireParentAnimation = () => {
		this.animation.setValue(this.state.yPosition);

		Animated.timing(this.animation, {
			toValue: 35,
			duration: 100,
			useNativeDriver: true,
			ease: Easing.linear,
		} as any).start(() => this.props.onSlideEnd());
	};

	fireChildAnimation = () => {
		const duration =
			this.props.drawerOpenSpeed &&
			this.props.drawerOpenSpeed >= 1 &&
			this.props.drawerOpenSpeed <= 5
				? (5 - this.props.drawerOpenSpeed + 1 - 0.5) * 300
				: 300;

		this.childAnimation.setValue(100);
		Animated.timing(this.childAnimation, {
			toValue: 0,
			duration: duration,
			useNativeDriver: true,
			ease: Easing.linear,
		} as any).start();
	};

	render() {
		const interpolated = this.animation.interpolate({
			inputRange: [0, 1],
			outputRange: [0, Dimensions.get('window').height],
		});

		const drawerSpeed =
			this.props.drawerOpenSpeed &&
			this.props.drawerOpenSpeed >= 1 &&
			this.props.drawerOpenSpeed <= 5
				? (5 - this.props.drawerOpenSpeed + 1) * 30
				: 30;

		const childInterpolated = this.childAnimation.interpolate({
			inputRange: [0, drawerSpeed],
			outputRange: [0, Dimensions.get('window').height],
		});
		let animatedStyle = {
			transform: [
				{
					translateY: interpolated,
				},
			],
		};

		let childAnimatedStyle = {
			transform: [
				{
					translateY: childInterpolated,
				},
			],
		};

		return (
			<Animated.View
				{...this.panResponder?.panHandlers}
				style={[
					{
						paddingTop: this.state.yPosition,
						backgroundColor: this.props.backdropColor
							? this.props.backdropColor
							: 'rgba(0,0,0,0.3)',
						zIndex: 90000,
						height: Dimensions.get('window').height,
						width: Dimensions.get('window').width,
						position: 'absolute',
					},
					animatedStyle,
				]}>
				<Animated.View
					style={[
						childAnimatedStyle,
						{ height: '100%' },
						this.props.drawerStyle,
					]}>
					{this.props.children && this.props.useCustomDrawer ? (
						this.props.children
					) : (
						<View
							style={{
								position: 'absolute',
								flexDirection: 'column',
								alignItems: 'center',
								backgroundColor: this.props.drawerBackgroundColor
									? this.props.drawerBackgroundColor
									: '#f7f8fc',
								height:
									this.props.drawerHeight && this.props?.drawerHeight <= 1
										? `${this.props.drawerHeight * 100}%`
										: `45%`,
								width: '100%',
								paddingTop: this.props.noDrawerHandle ? 25 : 50,
								bottom: 0,
								borderRadius: 15,
								zIndex: 90000,
							}}>
							{!this.props.noDrawerHandle && (
								<View
									style={{
										backgroundColor: this.props?.drawerHandleColor ?? 'black',
										height: 5,
										width: 90,
										top: 25,
										position: 'absolute',
									}}></View>
							)}
							{this.props.children}
						</View>
					)}
				</Animated.View>
			</Animated.View>
		);
	}
}

export default SlidableDrawer;
