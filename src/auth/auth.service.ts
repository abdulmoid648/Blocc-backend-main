import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { UserService } from 'src/user/user.service';
import firebaseAdmin from 'src/firebase/firebase.config';
const SALT = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, name, password } = signUpDto;

    const userByEmail = await this.userModel.findOne({ email });
    if (userByEmail) {
      throw new BadRequestException('Email already in use!');
    }

    // Create a new user
    const hashedPassword = await bcrypt.hash(password, SALT);

    const user = new this.userModel({ email, name, password: hashedPassword });

    const savedUser = await user.save();
    //  USER ONLINE
    await this.userModel.findByIdAndUpdate(savedUser._id, {
      isOnline: true,
    });
    // Generate JWT
    const payload = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      isActive: savedUser.isActive,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const responseUser = await this.userService.getCurrentUser(
      user._id.toString(),
    );

    return { user: responseUser, accessToken };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    // 1) Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Bad Credentials');
    }

    if (!user.isActive) {
      throw new BadRequestException('Your account has no longer active');
    }
    if (!user.password) {
      throw new BadRequestException(
        'This account uses Google login. Please sign in with Google.',
      );
    }
    // 2) Check for password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new NotFoundException('Bad Credentials');
    }
    await this.userModel.findByIdAndUpdate(user._id, {
      isOnline: true,
    });
    // 3) Generate JWT
    // Generate JWT
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const responseUser = await this.userService.getCurrentUser(
      user._id.toString(),
    );

    return { user: responseUser, accessToken };
  }
  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      isOnline: false,
    });

    return {
      success: true,
      isOnline: false,
      message: 'Logged out successfully',
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  async googleAuth(idToken: string) {
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

    const { email, name, uid } = decoded;

    if (!email) {
      throw new BadRequestException('No email returned from Google');
    }

    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = await this.userModel.create({
        name: name || 'Google User',
        email,
        googleId: uid,
        authProvider: 'google',
        password: null,
      });
    }

    if (!user.isActive) {
      throw new BadRequestException('Your account has no longer active');
    }

    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const responseUser = await this.userService.getCurrentUser(
      user._id.toString(),
    );

    return { user: responseUser, accessToken };
  }
}
